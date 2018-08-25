const server = require('./lib/server');

const init = () => {
    server.init();
};

init();

module.exports = {
    init
};
