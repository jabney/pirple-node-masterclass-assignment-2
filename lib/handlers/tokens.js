const dataStore = require('../helpers/dataStore');
const {
    validateEmail,
    validateString,
    validateTokenId
} = require('../helpers/validators');
const helpers = require('../helpers/utils');

const postToken = (data, callback) => {
    const email = validateEmail(data.payload.email);
    const password = validateString(data.payload.password);

    if (email && password) {
        dataStore.read('users', email, (readError, userData) => {
            if (!readError && userData) {
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
                    dataStore.create('tokens', tokenId, tokenObject, (createError) => {
                        if (!createError) {
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

const getToken = (data, callback) => {
    const tokenId = validateTokenId(data.queryStringObject.tokenId);

    if (tokenId) {
        dataStore.read('tokens', tokenId, (getError, tokenData) => {
            if (!getError && tokenData) {
                callback(200, tokenData);
            } else {
                callback(404, 'Token ID not found');
            }
        });
    } else {
        callback(400, 'Missing token ID');
    }
};

const putToken = (data, callback) => {
    const tokenId = validateTokenId(data.queryStringObject.tokenId);

    if (tokenId) {
        dataStore.read('tokens', tokenId, (readError, tokenData) => {
            if (!readError && tokenData) {
                const isTokenValid = tokenData.expires > Date.now();

                if (isTokenValid) {
                    const oneHourFromNow = Date.now() + 1000 * 60 * 60;

                    tokenData.expires = oneHourFromNow;

                    dataStore.update('tokens', tokenId, tokenData, (updateError) => {
                        if (!updateError) {
                            callback(200, {success: 'token was extended'});
                        } else {
                            callback(500, {error: 'Could not update token'});
                        }
                    });
                } else {
                    callback(400, {error: 'Token has already expired and cannot be extended'});
                }
            } else {
                callback(404, {error: 'Token not found'});
            }
        });
    } else {
        callback(403, {error: 'Missing token ID'});
    }
};

const deleteToken = (data, callback) => {
    const tokenId = validateTokenId(data.queryStringObject.tokenId);

    if (tokenId) {
        dataStore.read('tokens', tokenId, (readError, tokenData) => {
            if (!readError && tokenData) {
                dataStore.delete('tokens', tokenId, (deleteError) => {
                    if (deleteError) {
                        callback(200, {success: 'The token was deleted'})
                    } else {
                        callback(500, {error: 'Could not delete the specified token'});
                    }
                });
            } else {
                callback(404, {error: 'Token not found'});
            }
        });
    } else {
        callback(403, {error: 'Missing token ID'});
    }
};

const verifyToken = (tokenId, email, callback) => {
    dataStore.read('tokens', tokenId, function (readError, tokenData) {
        if (!readError && tokenData) {
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
    delete: deleteToken,
    get: getToken,
    post: postToken,
    put: putToken,
    verifyToken
};
