const validateString = (str) => {
    return typeof str === 'string' && str.trim().length > 0 ? str.trim() : null;
};

const validateEmail = (str) => {
    // from emailregex.com
    const emailRegExp = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    return typeof str === 'string' && str.trim().length > 0 && str.match(emailRegExp) ? str.trim() : null;
};

module.exports = {
    validateEmail,
    validateString
};
