const users = require('./users');
const tokens = require('./tokens');
const menu = require('./menu');
const cart = require('./cart');

const notFound = (data, callback) => {
    callback(404);
};

const validMethods = [
    'delete',
    'get',
    'post',
    'put'
];

const methodChecker = (apiType, data, callback) => {
    const method = data.method.toLowerCase();

    if (validMethods.indexOf(method) > -1) {
        try {
            apiType[method](data, callback)
        } catch(error) {
            callback(405, {error: 'Invalid method call'});
        }
    } else {
        callback(405);
    }
};

module.exports = {
    cart: (data, callback) => methodChecker(cart, data, callback),
    menu: (data, callback) => methodChecker(menu, data, callback),
    notFound,
    tokens: (data, callback) => methodChecker(tokens, data, callback),
    users: (data, callback) => methodChecker(users, data, callback)
};
