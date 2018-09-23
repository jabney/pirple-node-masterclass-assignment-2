# Node Masterclass Assignment 2: Pizza API

## How to Run the App
1. This assumes you have nvm and node 10. Run `nvm use`.
1. Run `npm run seed` to set up the required folders.
1. Generate a `cert.pem` and `key.pem` and add them to the `./http` directory.
1. Run `npm start`.

## Testing the App

### Set Up Stripe Test Account
Stripe is used to issue a credit card charge for our customer pizza orders.
1. Set up your [Stripe](https://stripe.com) account.
1. Create a fake customer [here](https://dashboard.stripe.com/test/customers)
1. Use the fake VISA card from [this list](https://stripe.com/docs/testing#cards). `4242 4242 4242 4242`. Add it to the fake customer you created.
1. Update `./lib/config.js` > both `<environment>.stripe.authToken` with the Stripe auth token. Get this from [`Developers` > `API keys`](https://dashboard.stripe.com/account/apikeys).
1. Write down the information needed to create your fake requests:
    - Customer ID - Get this from [`Customers`](https://dashboard.stripe.com/test/customers) > `Details` > `ID`
    - Customer Email - Get this from [`Customers`](https://dashboard.stripe.com/test/customers) > `Details` > `Email`
    - Card ID - Get this from [`Customers`](https://dashboard.stripe.com/test/customers) > `Cards` > expand your card > `ID`

### Set Up Mailgun Test Account
Mailgun is used to send a confirmation email for our customer pizza orders.
1. Set up your [Mailgun](https://www.mailgun.com/) account.
1. Add a new [Domain](https://app.mailgun.com/app/domains).
1. Add your email as a [Recipient](https://app.mailgun.com/app/account/authorized). We'll only be using this to test.
1. Verify your email.
1. Click the Domain you created.
1. Update `./lib/config.js` > `<environment>.mailgun.domain` with your `Domain`. It should look something like `sandbox****************************.mailgun.org`.
1. Update `./lib/config.js` > `<environment>.mailgun.apiKey` with your `API Key`. It should look something like `*******************-******-****`.

### Ordering Pizza
Here are instructions on how to test the main methods needed for this assignment.

#### Setting Up Postman
I suggest you use [Postman](https://www.getpostman.com/apps) to test this app. You can take advantage of its Environment Variables to make testing easy. The examples below will include Postman variables (indicated with `{{}}`). These are the variables I used:
- `token`
- `cardId`
- `customerId`
- `targetEmail`
- `password`

#### `/users`
##### Create a User.
1. POST `https://localhost:5556/users`.
1. Body (raw application/json):
    ```json
    {
        "firstName": "Aang",
        "lastName": "Airbender",
        "email": "{{targetEmail}}",
        "password": "{{password}}",
        "country": "Air Nation",
        "streetAddress1": "123 Air Bison Way",
        "streetAddress2": "",
        "city": "Western Air Temple",
        "province": "Western Province",
        "postalCode": "00010",
        "phoneNumber": "5551234567"
    }
    ```
1. Note that we storing name, email address, and street address. Their email will be the primary key for their membership.

##### Get User
1. Make sure you've added your `tokenId` and are passing it in `headers.token`.
1. GET `https://localhost:5556/users?email={{targetEmail}}`.
1. You should see the user selected and an entry in `.data/users`.

#### Modify a User
1. Make sure you've added your `tokenId` and are passing it in `headers.token`.
1. PUT `https://localhost:5556/users`
1. Body (raw application/json):
    ```json
    {
        "city": "Western Air Temple",
        "phoneNumber": "",
        "email": "{{targetEmail}}",
        "password": "{{password}}"
    }
    ```
1. You should be able to `Get User` again with the details updated. In the example above we change the `city` and remove the `phoneNumber`.

#### Delete a User
1. Make sure you've added your `tokenId` and are passing it in `headers.token`.
1. DELETE `https://localhost:5556/users`
1. Body (raw application/json):
    ```json
    {
        "email": "{{targetEmail}}",
        "password": "{{password}}"
    }
    ```

#### `/tokens`
##### Create a Token
1. POST `https://localhost:5556/tokens`.
1. Body (raw application/json):
    ```json
    {
        "email": "{{targetEmail}}",
        "password": "{{password}}"
    }
    ```
1. **Copy the response `tokenId`**.

##### Delete a Token
Use this to logout of the application.
1. DELETE `https://localhost:5556/tokens?tokenId={{token}}`.
1. Try to call any end-point. It should return an error with "Missing or invalid token".

#### `/menu`
##### Get Menu
You'll need to reference this to create an order. You can also just refer to `.data/menu/items.json`.
1. Make sure you've added your `tokenId` and are passing it in `headers.token`.
1. GET `https://localhost:5556/menu?email={{targetEmail}}`.

#### `/order`
##### Create an Order
1. Make sure you've added your `tokenId` and are passing it in `headers.token`.
1. You will have to hand-craft your pizza order to simulate the shopping cart. This requires getting to know the API (which is pretty basic at the moment). In the real world, a UI would make ths an intuitive process. The Order API requires:
    - `size`
    - `toppings` with the various options desired. For type `single`, you can choose zero or one, so use a string literal matching the key. For type `multiple`, use an array of the keys you want to select. The application will calculate the price of the pizza based on your selections. See the examples below.
1. You will need to have your Stripe info handy, and make sure that that the receipt email is your verified Mailgun email.
1. POST `https://localhost:5556/order`
1. Body (raw application/json):
    ```json
    {
        "cardId": "{{cardId}}",
        "customerId": "{{customerId}}",
        "email": "{{targetEmail}}",
        "receiptEmail": "{{targetEmail}}",
        "order": {
            "size": "LARGE",
            "toppings": {
            "cheese": "MOZZARELLA",
            "meat": [
                "PEPPERONI",
                "SPICY_SAUSAGE"
            ],
            "vegetables": [
                "TOMATOES"
            ]
            }
        }
    }
    ```
1. You should receive a response saying that the order was placed and that a confirmation email was sent.
1. Login to Stripe and check out [test payments](https://dashboard.stripe.com/test/payments). You should be able to see your charge.
1. Open your email. You should have a confirmation email with the matching amount.

#### `/charge`
##### Create a Charge
Note that this will email you a confirmation.
1. Make sure you've added your `tokenId` and are passing it in `headers.token`.
1. POST `https://localhost:5556/charge`
1. Body (raw application/json):
    ```json
    {
        "amount": 7500,
        "cardId": "{{cardId}}",
        "customerId": "{{customerId}}",
        "email": "{{targetEmail}}",
        "receiptEmail": "{{targetEmail}}"
    }
    ```
#### `/email`
##### Send an Email
1. Make sure you've added your `tokenId` and are passing it in `headers.token`.
1. POST `https://localhost:5556/email`
1. Body (raw application/json):
    ```json
    {
        "body": "Hello there!",
        "subject": "Hi!",
        "email": "{{targetEmail}}",
        "customerEmail": "{{targetEmail}}"
    }
    ```

#### Undocumented End-Points
- Get Token
- Update Token

## Original Assignment Requirements
You are building the API for a pizza-delivery company. Don't worry about a frontend, just build the API. Here's the spec from your project manager:

1. New users can be created, their information can be edited, and they can be deleted. We should store their name, email address, and street address.
2. Users can log in and log out by creating or destroying a token.
3. When a user is logged in, they should be able to GET all the possible menu items (these items can be hardcoded into the system).
4. A logged-in user should be able to fill a shopping cart with menu items
5. A logged-in user should be able to create an order. You should integrate with the Sandbox of Stripe.com to accept their payment. Note: Use the stripe sandbox for your testing. Follow this link and click on the "tokens" tab to see the fake tokens you can use server-side to confirm the integration is working: https://stripe.com/docs/testing#cards
6. When an order is placed, you should email the user a receipt. You should integrate with the sandbox of Mailgun.com for this. Note: Every Mailgun account comes with a sandbox email account domain (whatever@sandbox123.mailgun.org) that you can send from by default. So, there's no need to setup any DNS for your domain for this task https://documentation.mailgun.com/en/latest/faqs.html#how-do-i-pick-a-domain-name-for-my-mailgun-account

This is an open-ended assignment. You may take any direction you'd like to go with it, as long as your project includes the requirements. It can include anything else you wish as well.
