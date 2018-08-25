const https = require('https');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;
const config = require('./config')();
const fs = require('fs');
const path = require('path');
const util = require('util');

const httpsServerOptions = {
    cert: fs.readFileSync(path.join(__dirname, '/../https/cert.pem')),
    key: fs.readFileSync(path.join(__dirname, '/../https/key.pem'))
};

const server = {};

const startHttpsServer = () => {
    server.httpsServer = https.createServer(httpsServerOptions, (req, res) => {
        console.log(req);
    });

    server.httpsServer.listen(config.httpsPort, () => {
        const blue = '\x1b[36m%s\x1b[0m';

        console.log(blue, `The ${config.envName} HTTPS server is listening on port ${config.httpsPort}`);
    });
};

server.shutDown = () => {
    server.httpsServer.close(() => {
        const red = '\x1b[31m%s\x1b[0m';

        console.log(red, `The ${config.envName} HTTPS server has shut down`);
    });
};

server.init = () => {
    startHttpsServer();
};

module.exports = server;
