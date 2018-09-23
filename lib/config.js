const environments = {
    production: {
        envName: 'production',
        hashingSecret: 'myBigComolicatedProdSecret',
        httpPort: 6666,
        httpsPort: 6667,
        mailgun: {
            apiKey: '<Your Public Key>',
            domain: '<Your Domain>'
        },
        stripe: {
            authToken: '<Your API Secret Goes Here>'
        }
    },
    staging: {
        envName: 'staging',
        hashingSecret: 'myStagingSecret',
        httpPort: 5555,
        httpsPort: 5556,
        mailgun: {
            apiKey: '<Your Public Key>',
            domain: '<Your Domain>'
        },
        stripe: {
            authToken: '<Your API Secret Goes Here>'
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
