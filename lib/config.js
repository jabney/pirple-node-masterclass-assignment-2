const environments = {
    production: {
        envName: 'production',
        hashingSecret: 'myBigComolicatedProdSecret',
        httpPort: 6666,
        httpsPort: 6667,
        stripe: {
            apiKey: 'your_stripe_key_goes_here',
            testCard: '4242424242424242',
            token: 'tok_visa'
        }
    },
    staging: {
        envName: 'staging',
        hashingSecret: 'myStagingSecret',
        httpPort: 5555,
        httpsPort: 5556,
        stripe: {
            apiKey: 'your_stripe_key_goes_here',
            testCard: '4242424242424242',
            token: 'tok_visa'
        }
    }
};

module.exports = () => {
    const nodeEnv = typeof process.env.NODE_ENV === 'string' ?
        process.env.NODE_ENV.toLowerCase()
        : '';

    return typeof environments[nodeEnv] === 'object' ?
        environments[nodeEnv]
        : environments.staging;
};
