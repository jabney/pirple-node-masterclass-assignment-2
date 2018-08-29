const dataStore = require('../helpers/dataStore');
const {
    validateString
} = require('../helpers/validators');
const {verifyToken} = require('./tokens');

const postCart = (data, callback) => {
    const {
        email,
        items
    } = data.payload;

    if (email && items) {
        const token = validateString(data.headers.token);

        verifyToken(token, email, (isTokenValid) => {
            if (isTokenValid) {
                const now = new Date();
                const orderPlaced = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
                const orderId = `${email}-${orderPlaced}`;

                dataStore.read('orders', orderId, (readError) => {
                    const orderDoesNotExist = readError;
                    if (orderDoesNotExist) {
                        const fortyFiveMinutesFromNow = now * 1000 * 60 * 45;
                        const orderGuaranteedDeliveryTime = fortyFiveMinutesFromNow;
                        const order = {
                            email,
                            items,
                            orderGuaranteedDeliveryTime,
                            orderId,
                            orderPlaced
                        };

                        dataStore.create('orders', orderId, order, (createError) => {
                            if (!createError) {
                                callback(200, {success: `Order ${email} was created`});
                            } else {
                                callback(500, {error: `Could not create order`});
                            }
                        });
                    } else {
                        callback(500, {error: 'The order already exists'});
                    }
                });
            } else {
                callback(403, {error: 'Missing or invalid token'});
            }
        });
    }
};

const getCart = (data, callback) => {
    const email = validateString(data.queryStringObject.email);
    const orderId = validateString(data.queryStringObject.order);

    if (email && orderId) {
        const token = validateString(data.headers.token);

        verifyToken(token, email, (isTokenValid) => {
            if (isTokenValid) {
                dataStore.read('orders', orderId, (readError, orderData) => {
                    if (!readError && orderData) {
                        callback(200, orderData);
                    } else {
                        callback(404, {error: `Cart data not found`});
                    }
                });
            } else {
                callback(403, {error: 'Missing or invalid token'});
            }
        });
    } else {
        callback(403, {error: 'Missing fields'});
    }
};

module.exports = {
    get: getCart,
    post: postCart
};
