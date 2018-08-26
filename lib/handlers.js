const users = require('./handlers/users');
const tokens = require('./handlers/tokens');

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
        apiType[method](data, callback)
    } else {
        callback(405);
    }
};

module.exports = {
    notFound,
    tokens: (data, callback) => methodChecker(tokens, data, callback),
    users: (data, callback) => methodChecker(users, data, callback)
};
