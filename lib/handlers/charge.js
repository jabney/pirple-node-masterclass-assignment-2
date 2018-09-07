const https = require('https');
const config = require('../config')();
const querystring = require('querystring');
const {
    validateAmount,
    validateEmail,
    validateString
} = require('../helpers/validators');

const postCharge = (data, callback) => {
    const email = validateEmail(data.payload.email);
    const amount = validateAmount(data.payload.amount);
    const cardId = validateString(data.payload.cardId);
    const customerId = validateString(data.payload.customerId);

    if (email && amount !== null && customerId && cardId) {
        const orderPayload = {
            amount: data.payload.amount,
            customer: customerId,
            currency: 'usd',
            receipt_email: email,
            source: cardId
        };

        const orderRequest = querystring.stringify(orderPayload);

        const requestDetails = {
            protocol: 'https:',
            host: 'api.stripe.com',
            path: '/v1/charges',
            port: 443,
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${config.stripe.authToken}`,
                'Content-Length': Buffer.byteLength(orderRequest),
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            ciphers: 'DEFAULT:!aNULL:!eNULL:!LOW:!EXPORT:!SSLv2:!MD5'
        };

        const req = https.request(requestDetails, (res) => {
            if (res.statusCode >= 400) {
                callback(res.statusCode, {error: res.statusMessage});
            } else {
                callback(200, {
                    success: 'Charge was successful'
                });
            }
        });

        req.on('socket', (socket) => {
            if (socket.connecting) {
                socket.on('secureConnect', () => {
                    req.write(orderRequest);
                    req.end();
                });
            } else {
                req.write(orderRequest);
                req.end();
            }
        });

        req.on('error', (error) => {
            callback(400, error);
        });
    } else {
        callback(400, {error: 'The request is missing required fields. Note that the amount must be higher than 50 cents.'});
    }
};

module.exports = {
    post: postCharge
};
