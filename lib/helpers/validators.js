const validateString = (str) =>
    typeof str === 'string' && str.trim().length > 0 ? str.trim() : null;

const validateNumber = (num) =>
    typeof num === 'number' ? num : null;

const MINIMUM_AMOUNT = 50;

const validateAmount = (num) =>
    validateNumber(num) && num >= MINIMUM_AMOUNT ? num : null;

// from emailregex.com
const emailRegExp = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

const validateEmail = (str) =>
    typeof str === 'string' && str.trim().length > 0 && str.match(emailRegExp) ? str.trim() : null;

const validateToken = (str) =>
    typeof str === 'string' ? str : null;

const validateTokenId = (str) =>
    typeof str === 'string' && str.trim().length === 32 ? str.trim() : null;

module.exports = {
    validateAmount,
    validateEmail,
    validateNumber,
    validateString,
    validateToken,
    validateTokenId
};
