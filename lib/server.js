const https = require('https');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;
const config = require('./config')();
const fs = require('fs');
const path = require('path');

const handlers = require('./handlers');

const red = '\x1b[31m%s\x1b[0m';
const green = '\x1b[32m%s\x1b[0m';
const blue = '\x1b[36m%s\x1b[0m';

const server = {};

const httpsServerOptions = {
    cert: fs.readFileSync(path.join(__dirname, '/../https/cert.pem')),
    key: fs.readFileSync(path.join(__dirname, '/../https/key.pem'))
};

const router = {
    cart: handlers.cart,
    menu: handlers.menu,
    tokens: handlers.tokens,
    users: handlers.users
};

const startHttpsServer = () => {
    server.httpsServer = https.createServer(httpsServerOptions, (req, res) => {
        const parsedUrl = url.parse(req.url, true);
        const parsedPath = parsedUrl.pathname;
        const cleanUpPathRegExp = /^\/+|\/+$/g;
        const trimmedPath = parsedPath.replace(cleanUpPathRegExp, '');

        const queryStringObject = parsedUrl.query;

        const method = req.method.toUpperCase();

        const headers = req.headers;
        const decoder = new StringDecoder('utf-8');
        const helpers = require('./helpers/utils');

        let buffer = '';

        req.on('data', (data) => {
            buffer += decoder.write(data);
        });

        req.on('end', () => {
            buffer += decoder.end();

            const activeHandler = typeof router[trimmedPath] !== 'undefined' ?
                router[trimmedPath]
                : handlers.notFound;

            const data = {
                headers,
                method,
                payload: helpers.parseJsonToObject(buffer),
                queryStringObject,
                trimmedPath
            };

            activeHandler(data, (statusCode, payload) => {
                statusCode = typeof statusCode === 'number' ? statusCode : 200;
                payload = typeof payload === 'object' ? payload : {};

                const payloadString = JSON.stringify(payload);

                res.setHeader('content-type', 'application/json');
                res.writeHead(statusCode);
                res.end(payloadString);

                if (statusCode === 200) {
                    console.log(green, `${method.toUpperCase()} /${trimmedPath} ${statusCode}`);
                } else {
                    console.log(red, `${method.toUpperCase()} /${trimmedPath} ${statusCode}`);
                }
            });
        });
    });

    server.httpsServer.listen(config.httpsPort, () => {
        console.log(blue, `The ${config.envName} HTTPS server is listening on port ${config.httpsPort}`);
    });
};

const shutDown = () => {
    server.httpsServer.close(() => {
        console.log(red, `The ${config.envName} HTTPS server has shut down`);
    });
};

const init = () => {
    startHttpsServer();
};

module.exports = {
    init,
    shutDown
};
