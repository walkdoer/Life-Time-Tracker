'use strict';

var fs = require('fs'),
    path = require('path'),
    moment = require('moment'),
    extend = require('node.extend'),
    when = require('when');
var config = require('./config.json');

//const
var DATA_FILE_PRIFIX = config.logDir;

function isValidDate(date) {
    if (Object.prototype.toString.call(date) === '[object Date]') {
        return !isNaN(date.getTime());
    } else {
        return false;
    }
}

function readLogFiles(date) {
    var dateArr = date.split('-').map(function (val) {
        return parseInt(val, 10);
    });
    var fileName = dateArr.join('/') + '.md';
    var deferred = when.defer(),
        filePath = path.resolve(__dirname, [DATA_FILE_PRIFIX, fileName].join('/'));
    fs.readFile(filePath, 'utf8', function (err, data) {
        if (err) {
            return deferred.reject(err, filePath);
        }
        deferred.resolve({
            fileContent: data,
            date: date
        });
    });

    return deferred.promise;
}


function readLogFilesSync(date) {

    var dateArr = date.split('-');
    var fileName = dateArr.join('/') + '.md',
        filePath = path.resolve(__dirname, [DATA_FILE_PRIFIX, fileName].join('/'));
    var fileData = fs.readFileSync(filePath, 'utf8');
    return {
        data: fileData,
        date: dateArr.join('-')
    };
}

function getDayNumInMonth (year, month) {
    return new Date(year, month, 0).getDate();
}


function isDayValid(y, m, d) {
    //the day number of one month
    var dayNum = getDayNumInMonth(y, m);
    return d <= dayNum && d > 0;
}

var dateFormat = 'YYYY-MM-DD HH:mm',
    timeFormat = 'HH:mm';
function formatDate (date) {
    return format(date, dateFormat);
}

function format (date, formatStr) {
    var m;
    if (typeof date === 'string') {
        m = new moment(date, dateFormat);
    } else {
        m = new moment(date);
    }
    return m.format(formatStr);
}

function formatTime (time) {
    return format(time, timeFormat);
}

function mean(days, prop) {
    var total = days.length;
    var sum = days.reduce(function (sum, value) {
        return sum += value[prop];
    }, 0);
    return sum/total;
}


function frequence(data, filter, creator) {
    return data.reduce(function (result, d){
        var target = result.filter(filter.bind(null, d));
        if (target && target.length > 0) {
            target[0].frequence++;
        } else {
            if (creator) {
                d = creator(d);
            }
            d = extend({frequence: 1}, d);
            result.push(d);
        }
        return result;
    }, []);
}

function inversObj(obj) {
    var result = {};
    Object.keys(obj).forEach(function (key) {
        result[obj[key]] = key;
    });
    return result;
}

module.exports = {
    isValidDate: isValidDate,
    readLogFiles: readLogFiles,
    readLogFilesSync: readLogFilesSync,
    getDayNumInMonth: getDayNumInMonth,
    isDayValid: isDayValid,
    formatTime: formatTime,
    formatDate: formatDate,
    timeFormat: timeFormat,
    dateFormat: dateFormat,
    frequence: frequence,
    inversObj: inversObj,
    mean: mean
};
