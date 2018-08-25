const fs = require('fs');
const path = require('path');
const helpers = require('./helpers');

const baseDirectory = path.join(__dirname, '/../.data/')

const read = (directory, fileName, callback) => {
    const filePath = `${baseDirectory}${directory}/${fileName}.json`;

    fs.readFile(filePath, 'utf8', function (err, data) {
        if (!err && data) {
            const parsedData = helpers.parseJsonToObject(data);

            callback(false, parsedData);
        } else {
            callback(err, data);
        }
    });
};

const create = (directory, fileName, data, callback) => {
    const filePath = `${baseDirectory}${directory}/${fileName}.json`;

    fs.open(filePath, 'wx', function (err, fileData) {
        if (!err && fileData) {
            const stringifiedData = JSON.stringify(data);

            fs.writeFile(fileData, stringifiedData, function (err) {
                if (!err) {
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
            callback('Cound not create new file, it may already exist');
        }
    });
};

module.exports = {
    create,
    read
};
