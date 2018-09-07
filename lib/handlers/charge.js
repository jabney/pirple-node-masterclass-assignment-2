const https = require('https');
const config = require('../config')();
const querystring = require('querystring');
const {
    validateAmount,
    validateEmail,
    validateString
} = require('../helpers/validators');
const {verifyToken} = require('./tokens');

const postCharge = (data, callback) => {
    const email = validateEmail(data.payload.email);
    const receiptEmail = validateString(data.payload.receiptEmail);
    const amount = validateAmount(data.payload.amount);
    const cardId = validateString(data.payload.cardId);
    const customerId = validateString(data.payload.customerId);
    const token = validateString(data.headers.token);

    if (email && receiptEmail && amount !== null && customerId && cardId && token) {
        verifyToken(token, email, (isTokenValid) => {
            if (isTokenValid) {
                const orderPayload = {
                    amount: data.payload.amount,
                    customer: customerId,
                    currency: 'usd',
                    receipt_email: receiptEmail,
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
                callback(403, {error: 'Missing or invalid token'});
            }
        });
    } else {
        callback(400, {error: 'The request is missing required fields. Note that the amount must be higher than 50 cents.'});
    }
};

module.exports = {
    post: postCharge
};
