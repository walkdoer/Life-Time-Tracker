'use strict';

var fs = require('fs');
var when = require('when');

//const
var DATA_FILE_PRIFIX = '../logs';

function isValidDate(date) {
    if (Object.prototype.toString.call(date) === '[object Date]') {
        return !isNaN(date.getTime());
    } else {
        return false;
    }
}

function readLogFiles(y, m, d) {
    var dateArr = [y, m, d].filter(function (val) { return !!val; });
    var fileName = dateArr.join('/') + '.md';
    var deferred = when.defer(),
        filePath = [DATA_FILE_PRIFIX, fileName].join('/');
    fs.readFile(filePath, 'utf8', function (err, data) {
        if (err) {
            return deferred.reject(err, filePath);
        }
        deferred.resolve({
            data: data,
            date: dateArr.join('-')
        });
    });

    return deferred.promise;
}

module.exports = {
    isValidDate: isValidDate,
    readLogFiles: readLogFiles
};
