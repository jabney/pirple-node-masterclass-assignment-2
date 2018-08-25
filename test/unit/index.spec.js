const sinon = require('sinon');

const server = require('../../lib/server');

describe('main application', () => {
    afterEach(() => {
        sinon.restore();
    });

    it('should start the app', () => {
        const serverStub = sinon.stub(server, 'init');

        require('../../index');

        sinon.assert.calledOnce(serverStub);
    });
});
