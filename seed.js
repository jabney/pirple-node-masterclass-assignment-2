const fs = require('fs');
const path = require('path');

const getDirectoryCreationMethod = (directoryPath) =>
    () => {
        fs.stat(path.join(__dirname, directoryPath), (err, stats) => {
            if (!stats) {
                fs.mkdirSync(path.join(__dirname, directoryPath));
            }
        });
    };

const checkAndCreateTokensDirectory = getDirectoryCreationMethod('.data/tokens');
const checkAndCreateUsersDirectory = getDirectoryCreationMethod('.data/users');

const checkAndCreateDirectories = () => {
    checkAndCreateTokensDirectory();
    checkAndCreateUsersDirectory();
};

const checkAndCreateDataDirectory = () => {
    fs.stat(path.join(__dirname, '.data'), (err, stats) => {
        if (!stats) {
            fs.mkdirSync(path.join(__dirname, '.data'));

            checkAndCreateDirectories();
        } else {
            checkAndCreateDirectories();
        }
    });
};

const checkAndCreateHttpsDirectory = () => getDirectoryCreationMethod('https');;

checkAndCreateDataDirectory();
checkAndCreateHttpsDirectory();
