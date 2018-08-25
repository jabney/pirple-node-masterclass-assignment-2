const environments = {
    production: {
        envName: 'production',
        hashingSecret: 'myBigComolicatedProdSecret',
        httpPort: 6666,
        httpsPort: 6667
    },
    staging: {
        envName: 'staging',
        hashingSecret: 'myStagingSecret',
        httpPort: 5555,
        httpsPort: 5556
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
