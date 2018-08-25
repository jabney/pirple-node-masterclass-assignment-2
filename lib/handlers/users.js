const storeUtils = require('../storeUtils');
const helpers = require('../helpers');
const {
    validateEmail,
    validateString,
} = require('../validators');

const post = (data, callback) => {
    const firstName = validateString(data.payload.firstName);
    const lastName = validateString(data.payload.lastName);
    const email = validateEmail(data.payload.email);
    const password = validateString(data.payload.password);

    if (firstName && lastName && email && password) {
        storeUtils.read('users', email, (err) => {
            const fileDoesNotExist = err;

            if (fileDoesNotExist) {
                const hashedPassword = helpers.hash(password);
                const newUser = {
                    email,
                    firstName,
                    lastName,
                    password: hashedPassword
                };

                storeUtils.create('users', email, newUser, (err) => {
                    if (!err) {
                        callback(200);
                    } else {
                        callback(500, {error: `Could not create user ${email}`});
                    }
                });
            } else {
                callback(500, {error: 'User already exists'});
            }
        });
    } else {
        callback(400, {error: 'Missing required fields'});
    }
};

module.exports = {
    post
};
