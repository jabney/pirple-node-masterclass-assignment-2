const fs = require('fs');
const path = require('path');
const helpers = require('./helpers');

const baseDirectory = path.join(__dirname, '/../.data/')

const readFile = (directory, fileName, callback) => {
    const filePath = `${baseDirectory}${directory}/${fileName}.json`;

    fs.readFile(filePath, 'utf8', function (readError, data) {
        if (!readError && data) {
            const parsedData = helpers.parseJsonToObject(data);

            callback(false, parsedData);
        } else {
            callback(readError, data);
        }
    });
};

const createFile = (directory, fileName, data, callback) => {
    const filePath = `${baseDirectory}${directory}/${fileName}.json`;

    fs.open(filePath, 'wx', function (openError, fileData) {
        if (!openError && fileData) {
            const stringifiedData = JSON.stringify(data);

            fs.writeFile(fileData, stringifiedData, function (writeError) {
                if (!writeError) {
                    fs.close(fileData, function (err) {
                        if (!err) {
                            callback(false);
                        } else {
                            callback('Error closing new file.');
                        }
                    });
                } else {
                    callback('Error writing new file.');
                }
            });
        } else {
            callback('Cound not create the new file. It may already exist');
        }
    });
};

const updateFile = (directory, fileName, data, callback) => {
    const filePath = `${baseDirectory}${directory}/${fileName}.json`;

    fs.open(filePath, 'r+', (openError, fileData) => {
        if (!openError && fileData) {
            const stringifiedData = JSON.stringify(data);

            fs.truncate(fileData, (truncateError) => {
                if (!truncateError) {
                    fs.writeFile(fileData, stringifiedData, (writeError) => {
                        if (!writeError) {
                            fs.close(fileData, (closeError) => {
                                if (!closeError) {
                                    callback(false);
                                } else {
                                    callback('Error closing file');
                                }
                            });
                        } else {
                            callback('Error writing to file');
                        }
                    })
                } else {
                    callback('Error truncating file');
                }
            });
        } else {
            callback('Cound not open file for updating. It may already exist');
        }
    });
};

const deleteFile = (directory, fileName, callback) => {
    const filePath = `${baseDirectory}${directory}/${fileName}.json`;

    fs.unlink(filePath, (unlinkError) => {
        if (!unlinkError) {
            callback(false);
        } else {
            callback('Error deleting file');
        }
    });
};

module.exports = {
    create: createFile,
    delete: deleteFile,
    read: readFile,
    update: updateFile
};
