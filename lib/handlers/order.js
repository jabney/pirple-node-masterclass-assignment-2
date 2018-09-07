const dataStore = require('../helpers/dataStore');
const {
    validateObject,
    validateString
} = require('../helpers/validators');
const {verifyToken} = require('./tokens');
const postCharge = require('./charge').post;

const validateOrder = (order, menuData) => {
    const required = Object.keys(menuData).filter((key) => {
        return menuData[key].isRequired;
    });

    return required.every((field) => {
        return typeof order[field] !== 'undefined';
    });
};

const calculateAmount = (size, order, menuData) => {
    const basePrice = size.price;

    return Object.keys(order.toppings).reduce((total, toppingType) => {
        const orderToppingDetails = order.toppings[toppingType];
        const menuToppingDetails = menuData.toppings[toppingType];

        if (menuToppingDetails.type === 'single') {
            if (orderToppingDetails !== 'undefined') {
                total += menuToppingDetails.items[orderToppingDetails].price;
            }
        } else { // assumes 'multiple'
            orderToppingDetails.forEach((toppingKey) => {
                total += menuToppingDetails.items[toppingKey].price;
            });
        }

        return total;
    }, basePrice);
};

const createOrder = (data, callback) => {
    const email = validateString(data.payload.email);
    const token = validateString(data.headers.token);
    const order = validateObject(data.payload.order);
    const cardId = validateString(data.payload.cardId);
    const customerId = validateString(data.payload.customerId);

    if (email && token && order && cardId && customerId) {
        verifyToken(token, email, (isTokenValid) => {
            if (isTokenValid) {
                dataStore.read('menu', 'items', (readError, menuData) => {
                    const size = menuData.size.items[order.size];

                    if (size && validateOrder(order, menuData)) {
                        const amount = calculateAmount(size, order, menuData);
                        const chargeData = data

                        chargeData.payload = {
                            amount,
                            cardId,
                            customerId,
                            email
                        };

                        postCharge(chargeData, (statusCode, details) => {
                            if (statusCode >= 400) {
                                callback(statusCode, details);
                            } else {
                                callback(200, {
                                    success: 'Order placed'
                                });
                            }
                        });

                    } else {
                        callback(403, {error: 'Missing order item(s)'});
                    }
                });
            } else {
                callback(403, {error: 'Missing or invalid token'});
            }
        });
    } else {
        callback(403, {error: 'Missing a required field'});
    }
};

module.exports = {
    post: createOrder
};
