const assert = require('assert');

describe('config', () => {
    const originalEnv = process.env;

    const stubProcessEnv = (nodeEnv) => {
        process.env = {
            NODE_ENV: nodeEnv
        };
    };

    afterEach(() => {
        process.env = originalEnv;
    });

    it('should return the config for staging by default', () => {
        stubProcessEnv('');

        const config = require('../../lib/config')();

        assert.strictEqual(config.envName, 'staging');
    });

    it('should return the config for production', () => {
        stubProcessEnv('PRODUCTION');

        const config = require('../../lib/config')();

        assert.strictEqual(config.envName, 'production');
    });
});
