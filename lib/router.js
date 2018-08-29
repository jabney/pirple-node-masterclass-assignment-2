const handlers = require('./handlers');

module.exports = {
    cart: handlers.cart,
    menu: handlers.menu,
    notFound: handlers.notFound,
    tokens: handlers.tokens,
    users: handlers.users
};
