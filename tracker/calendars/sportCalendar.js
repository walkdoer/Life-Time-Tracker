/**
 * sport calendar
 */

'use strict';

var scanner = require('../scanner');
var fileHelper = require('../fileHelper');

var logClassEnum = require('../enum/logClass');
exports.generate = function(options) {
    scanner.scan(options)
        .then(generateCalendar.bind(null, options));
};

function generateCalendar(options, scanResult) {
    var result = [];
    scanResult.days.forEach(function (day) {
        var logs = day.logs;
        var sportTime = 0;
        logs.forEach(function (log){
            if (isSportLog(log)) {
                sportTime += log.len;
            }
        });
        result.push({
            date: day.date,
            sportTime: sportTime
        });
    });
    console.log(result);
    var fileName = '../statResult/calendar/2014.json';
    fileHelper.json(fileName, result);
}


function isSportLog(log) {
    var classes = log.classes;
    return classes && classes.filter(function (cls) {
        return cls.code === logClassEnum.Sport;
    }).length > 0;
}
