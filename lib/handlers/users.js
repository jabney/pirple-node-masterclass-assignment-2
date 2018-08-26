const storeUtils = require('../storeUtils');
const helpers = require('../helpers');
const {
    validateEmail,
    validateString
} = require('../validators');

const postUser = (data, callback) => {
    const firstName = validateString(data.payload.firstName);
    const lastName = validateString(data.payload.lastName);
    const email = validateEmail(data.payload.email);
    const password = validateString(data.payload.password);

    if (firstName && lastName && email && password) {
        storeUtils.read('users', email, (readError) => {
            const fileDoesNotExist = readError;

            if (fileDoesNotExist) {
                const hashedPassword = helpers.hash(password);
                const newUser = {
                    email,
                    firstName,
                    lastName,
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

const putUser = (data, callback) => {
    const firstName = validateString(data.payload.firstName);
    const lastName = validateString(data.payload.lastName);
    const email = validateEmail(data.payload.email);
    const password = validateString(data.payload.password);

    if (email) {
        storeUtils.read('users', email, (err, userData) => {
            if (!err && userData) {
                if (firstName) {
                    userData.firstName = firstName;
                }
                if (lastName) {
                    userData.lastName = lastName;
                }
                if (password) {
                    userData.hashedPassword = helpers.hash(password);
                }
                storeUtils.update('users', email, userData, (err) => {
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
