const crypto = require('crypto');
const config = require('../config')();

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

const createRandomString = function (strLength) {
    strLength = typeof strLength === 'number' && strLength > 0 ? strLength : false;
    if (strLength) {
        const possibleCharacters = 'abcdefghijklmnopqrstuvwxyz0123456789';

        let str = '';
        for (let i = 1; i <= strLength; i++) {
            const randomCharacter = possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length));

            str += randomCharacter;
        }

        return str;
    }
};

const getDisplayPrice = (cents) => {
    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 2
    });

    return formatter.format(cents);
};

module.exports = {
    createRandomString,
    getDisplayPrice,
    hash,
    parseJsonToObject
};
