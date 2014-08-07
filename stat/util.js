'use strict';

var fs = require('fs');
var when = require('when');

//const
var DATA_FILE_PRIFIX = './logs';

function isValidDate(date) {
    if (Object.prototype.toString.call(date) === '[object Date]') {
        return !isNaN(date.getTime());
    } else {
        return false;
    }
}

function readLogFiles(fileName) {
    var deferred = when.defer(),
        filePath = [DATA_FILE_PRIFIX, fileName].join('/');
    fs.readFile(filePath, function (err, data) {
        if (err) {
            return deferred.reject(err);
        }
        deferred.resolve(data);
    });
}

module.exports = {
    isValidDate: isValidDate,
    readLogFiles: readLogFiles
};
