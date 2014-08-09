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

function readLogFiles(date) {
    var dateArr = date.split('-');
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

function getDayNumInMonth (year, month) {
    return new Date(year, month, 0).getDate();
}


function isDayValid(y, m, d) {
    //the day number of one month
    var dayNum = getDayNumInMonth(y, m);
    return d <= dayNum && d > 0;
}
module.exports = {
    isValidDate: isValidDate,
    readLogFiles: readLogFiles,
    getDayNumInMonth: getDayNumInMonth,
    isDayValid: isDayValid
};
