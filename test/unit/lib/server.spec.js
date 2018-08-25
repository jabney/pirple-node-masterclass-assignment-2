const assert = require('assert');
const sinon = require('sinon');
const https = require('https');

const server = require('../../../lib/server');

describe('server', () => {
    let consoleStub,
        serverCreateSpy,
        serverListenSpy;

    beforeEach(() => {
        consoleStub = sinon.stub(console, 'log');
        serverCreateSpy = sinon.spy(https, 'createServer');
        serverListenSpy = sinon.spy(https.Server.prototype, 'listen');
    });

    afterEach(() => {
        sinon.restore();
    });

    it('should create a default staging https server', async () => {
        await server.init();

        sinon.assert.calledWith(serverCreateSpy, sinon.match.has('cert'));
        sinon.assert.calledWith(serverCreateSpy, sinon.match.has('key'));
        sinon.assert.calledWith(serverListenSpy, sinon.match.number);
        sinon.assert.calledWith(consoleStub, sinon.match.string, sinon.match(/^The .* HTTPS server is listening on port .*/));

        server.shutDown();
    });

    it('should close the server', async () => {
        server.init();

        sinon.reset();

        await server.shutDown();

        sinon.assert.calledWith(consoleStub, sinon.match.string, sinon.match(/^The .* HTTPS server has shut down/));
    });
});
