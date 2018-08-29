const dataStore = require('../helpers/dataStore');
const {
    validateString
} = require('../helpers/validators');
const {verifyToken} = require('./tokens');

const getMenuItems = (data, callback) => {
    const email = validateString(data.queryStringObject.email);
    const token = validateString(data.headers.token);

    verifyToken(token, email, (isTokenValid) => {
        if (isTokenValid) {
            dataStore.read('menu', 'items', (readError, menuData) => {
                if (!readError && menuData) {
                    callback(200, menuData);
                } else {
                    callback(404, {error: `Menu data not found`});
                }
            });
        } else {
            callback(403, {error: 'Missing or invalid token'});
        }
    });
};

module.exports = {
    get: getMenuItems
};
