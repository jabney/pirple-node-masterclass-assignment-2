const https = require('https');
const config = require('../config')();
const querystring = require('querystring');
const {
    validateEmail,
    validateString
} = require('../helpers/validators');
const {verifyToken} = require('./tokens');

const postEmail = (data, callback) => {
    const email = validateEmail(data.payload.email);

    const customerEmail = validateString(data.payload.customerEmail);
    const emailSubject = validateString(data.payload.subject);
    const emailBody = validateString(data.payload.body);
    const token = validateString(data.headers.token);

    if (email && customerEmail && emailSubject && emailBody && token) {
        verifyToken(token, email, (isTokenValid) => {
            if (isTokenValid) {
                const emailPayload = {
                    from: config.mailgun.fromEmail,
                    subject: emailSubject,
                    text: emailBody,
                    to: customerEmail
                };

                const payloadString = querystring.stringify(emailPayload);

                const requestDetails = {
                    protocol: 'https:',
                    hostname: 'api.mailgun.net',
                    path: `/v3/${config.mailgun.domain}/messages`,
                    auth: `api:${config.mailgun.apiKey}`,
                    port: 443,
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Length': Buffer.byteLength(payloadString),
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                };

                const req = https.request(requestDetails, (res) => {
                    if (res.statusCode >= 400) {
                        callback(res.statusCode, {error: res.statusMessage});
                    } else {
                        callback(200, {
                            success: 'Email was successful'
                        });
                    }
                });

                req.on('error', (error) => {
                    callback(400, error);
                });

                req.write(payloadString);

                req.end();
            } else {
                callback(403, {error: 'Missing or invalid token'});
            }
        });
    } else {
        callback(400, {error: 'The request is missing required fields.'});
    }
};

module.exports = {
    post: postEmail
};
