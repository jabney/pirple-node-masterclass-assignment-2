const handlers = require('./handlers');

module.exports = {
    cart: handlers.cart,
    charge: handlers.charge,
    menu: handlers.menu,
    notFound: handlers.notFound,
    tokens: handlers.tokens,
    users: handlers.users
};
