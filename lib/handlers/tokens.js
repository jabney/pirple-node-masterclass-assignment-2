const storeUtils = require('../storeUtils');
const {
    validateEmail,
    validateString
} = require('../validators');
const helpers = require('../helpers');

const post = (data, callback) => {
    const email = validateEmail(data.payload.email);
    const password = validateString(data.payload.password);

    if (email && password) {
        storeUtils.read('users', email, (err, userData) => {
            if (!err && userData) {
                const hashedPassword = helpers.hash(password);

                if (hashedPassword === userData.password) {
                    const tokenId = helpers.createRandomString(32);
                    const oneHour = Date.now() + 1000 * 60 * 60;
                    const expires = oneHour;
                    const tokenObject = {
                        email,
                        expires,
                        tokenId
                    };
                    storeUtils.create('tokens', tokenId, tokenObject, (err) => {

                        if (!err) {
                            callback(200, tokenObject);
                        } else {
                            callback(500, 'Could not create the token');
                        }
                    });
                } else {
                    callback(400, 'Incorrect email password combination');
                }
            } else {
                callback(400, 'Could not locate user');
            }
        });
    } else {
        callback(400, 'Missing required fields');
    }
};

const verifyToken = (id, email, callback) => {
    storeUtils.read('tokens', id, function (err, tokenData) {
        if (!err && tokenData) {
            if (tokenData.email === email && tokenData.expires > Date.now()) {
                callback(true);
            } else {
                callback(false);
            }
        } else {
            callback(false);
        }
    });
};

module.exports = {
    post,
    verifyToken
};
