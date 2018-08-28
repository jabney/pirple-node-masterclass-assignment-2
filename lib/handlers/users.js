const storeUtils = require('../storeUtils');
const helpers = require('../helpers');
const {
    validateEmail,
    validateString
} = require('../validators');

const userFormFields = [
    {key: 'firstName', type: 'STRING'},
    {key: 'lastName', type: 'STRING'},
    {key: 'country', type: 'STRING'},
    {key: 'streetAddress1', type: 'STRING'},
    {key: 'streetAddress2', type: 'STRING'},
    {key: 'city', type: 'STRING'},
    {key: 'postalCode', type: 'STRING'},
    {key: 'province', type: 'STRING'},
    {key: 'phoneNumber', type: 'STRING'},
    {key: 'email', type: 'EMAIL'},
    {key: 'password', type: 'STRING'}
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
        console.error(data.payload);
    }
};

const getUser = (data, callback) => {
    const email = validateEmail(data.payload.email);

    if (email) {
        storeUtils.read('users', email, (readError, userData) => {
            if (!readError && userData) {
                delete userData.hashedPassword;
                callback(200, userData);
            } else {
                callback(404, {error: `User ${email} data not found`});
            }
        });
    } else {
        callback(400, {error: 'The request is missing email'});
    }
};

const staticOverwriteFields = [
    'firstName',
    'lastName',
    'country',
    'streetAddress1',
    'streetAddress2',
    'city',
    'postalCode',
    'province',
    'phoneNumber'
];

const getUpdatedUserData = (userData, payload) =>
    staticOverwriteFields.reduce((dataAccumulator, field) => {
        if (typeof payload[field] !== 'undefined') {
            dataAccumulator[field] = payload[field];
        }
        return dataAccumulator;
    }, userData);

const putUser = (data, callback) => {
    const email = validateEmail(data.payload.email);

    if (email) {
        const {password} = data.payload;

        storeUtils.read('users', email, (err, userData) => {
            if (!err && userData) {
                const updatedUserData = getUpdatedUserData(userData, data.payload);

                if (password) {
                    updatedUserData.hashedPassword = helpers.hash(password);
                }

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
        callback(400, {error: 'The request is missing email'});
    }
};

const deleteUser = (data, callback) => {
    const email = validateEmail(data.payload.email);

    if (email) {
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
        callback(403, {error: 'The request is missing email'});
    }
};

module.exports = {
    delete: deleteUser,
    get: getUser,
    post: postUser,
    put: putUser
};
