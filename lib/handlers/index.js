const cart = require('./cart');
const charge = require('./charge');
const email = require('./email');
const menu = require('./menu');
const order = require('./order');
const tokens = require('./tokens');
const users = require('./users');

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
            console.error(error);
        }
    } else {
        callback(405);
    }
};

module.exports = {
    cart: (data, callback) => methodChecker(cart, data, callback),
    charge: (data, callback) => methodChecker(charge, data, callback),
    email: (data, callback) => methodChecker(email, data, callback),
    menu: (data, callback) => methodChecker(menu, data, callback),
    order: (data, callback) => methodChecker(order, data, callback),
    notFound,
    tokens: (data, callback) => methodChecker(tokens, data, callback),
    users: (data, callback) => methodChecker(users, data, callback)
};
