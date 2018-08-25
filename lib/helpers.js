const crypto = require('crypto');
const config = require('./config')();

const parseJsonToObject = function (string) {
    try {
        const obj = JSON.parse(string);

        return obj;
    } catch (err) {
        return {};
    }
};

const hash = function (string) {
    if (typeof string === 'string' && string.length > 0) {
        const hash = crypto.createHmac('sha256', config.hashingSecret)
            .update(string)
            .digest('hex');

        return hash;
    } else {
        return false;
    }
};


module.exports = {
    hash,
    parseJsonToObject
};
