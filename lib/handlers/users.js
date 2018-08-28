const storeUtils = require('../storeUtils');
const helpers = require('../helpers');
const {
    validateEmail,
    validateString
} = require('../validators');
const {verifyToken} = require('./tokens');

const userFormFields = [
    {key: 'firstName', type: 'STRING', isOverwritable: true},
    {key: 'lastName', type: 'STRING', isOverwritable: true},
    {key: 'country', type: 'STRING', isOverwritable: true},
    {key: 'streetAddress1', type: 'STRING', isOverwritable: true},
    {key: 'streetAddress2', type: 'STRING', isOverwritable: true},
    {key: 'city', type: 'STRING', isOverwritable: true},
    {key: 'postalCode', type: 'STRING', isOverwritable: true},
    {key: 'province', type: 'STRING', isOverwritable: true},
    {key: 'phoneNumber', type: 'STRING', isOverwritable: true},
    {key: 'email', type: 'EMAIL', isOverwritable: false},
    {key: 'password', type: 'STRING', isOverwritable: true}
];

const fieldValidationMethodMap = {
    STRING: validateString,
    EMAIL: validateEmail
};

const isValidUser = (payload) =>
    userFormFields.every(({key, type}) =>
        typeof fieldValidationMethodMap[type](payload[key]) !== 'undefined'
    );

const postUser = (data, callback) => {
    if (isValidUser(data.payload)) {
        const {
            firstName,
            lastName,
            country,
            streetAddress1,
            streetAddress2,
            city,
            postalCode,
            province,
            phoneNumber,
            email,
            password,
        } = data.payload;
        storeUtils.read('users', email, (readError) => {
            const fileDoesNotExist = readError;

            if (fileDoesNotExist) {
                const hashedPassword = helpers.hash(password);
                const newUser = {
                    email,
                    firstName,
                    lastName,
                    country,
                    streetAddress1,
                    streetAddress2,
                    city,
                    postalCode,
                    province,
                    phoneNumber,
                    password: hashedPassword
                };

                storeUtils.create('users', email, newUser, (createError) => {
                    if (!createError) {
                        callback(200, {success: `User ${email} was created`});
                    } else {
                        callback(500, {error: `Could not create user ${email}`});
                    }
                });
            } else {
                callback(500, {error: 'The user already exists'});
            }
        });
    } else {
        callback(400, {error: 'The request is missing required fields'});
    }
};

const getUser = (data, callback) => {
    const email = validateEmail(data.queryStringObject.email);

    if (email) {
        const token = validateString(data.headers.token);

        verifyToken(token, email, (isTokenValid) => {
            if (isTokenValid) {
                storeUtils.read('users', email, (readError, userData) => {
                    if (!readError && userData) {
                        delete userData.hashedPassword;
                        callback(200, userData);
                    } else {
                        callback(404, {error: `User ${email} data not found`});
                    }
                });
            } else {
                callback(403, {error: 'Missing or invalid token'});
            }
        });
    } else {
        callback(400, {error: 'The request is missing email'});
    }
};

const getUpdatedUserData = (userData, payload) =>
    userFormFields.reduce((dataAccumulator, fieldConfig) => {
        const {key, isOverwritable} = fieldConfig;

        if (typeof payload[key] !== 'undefined' && isOverwritable) {
            dataAccumulator[key] = key === 'password' ?
                helpers.hash(payload[key])
                : payload[key];
        }
        return dataAccumulator;
    }, userData);

const putUser = (data, callback) => {
    const email = validateEmail(data.payload.email);

    if (email) {
        const token = validateString(data.headers.token);

        verifyToken(token, email, (isTokenValid) => {
            if (isTokenValid) {
                storeUtils.read('users', email, (err, userData) => {
                    if (!err && userData) {
                        const updatedUserData = getUpdatedUserData(userData, data.payload);

                        storeUtils.update('users', email, updatedUserData, (err) => {
                            if (!err) {
                                callback(200, {success: `User ${email} was updated`});
                            } else {
                                callback(500, {error: `Could not update the user ${email}`});
                            }
                        });
                    } else {
                        callback(400, {error: `User ${email} not found`});
                    }
                });
            } else {
                callback(403, {error: 'Missing or invalid token'});
            }
        });
    } else {
        callback(400, {error: 'The request is missing email'});
    }
};

const deleteUser = (data, callback) => {
    const email = validateEmail(data.payload.email);

    if (email) {
        const token = validateString(data.headers.token);

        verifyToken(token, email, (isTokenValid) => {
            if (isTokenValid) {
                storeUtils.read('users', email, (readError, userData) => {
                    if (!readError && userData) {
                        storeUtils.delete('users', email, (deleteError) => {
                            if (!deleteError) {
                                callback(200, {success: `User ${email} was deleted`});
                            } else {
                                callback(400, {error: `Could not delete the user ${email}`});
                            }
                        });
                    } else {
                        callback(400, {error: `Could not find user ${email}`});
                    }
                });
            } else {
                callback(403, {error: 'Missing or invalid token'});
            }
        });
    } else {
        callback(403, {error: 'The request is missing email'});
    }
};

module.exports = {
    delete: deleteUser,
    get: getUser,
    post: postUser,
    put: putUser
};
