/**
 * sport calendar
 */

'use strict';

var scanner = require('../scanner');
//var fileHelper = require('../fileHelper');
var Q = require('q');

var logClassEnum = require('../enum/logClass');
exports.generate = function(options) {
    var deferred = Q.defer();
    scanner.scan(options)
        .then(function (scanResult) {
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
            //cache the result
            //var fileName = '../statResult/calendar/2014.json';
            //fileHelper.json(fileName, result);
            deferred.resolve(result);
        });
    return deferred.promise;
};


function isSportLog(log) {
    var classes = log.classes;
    return classes && classes.filter(function (cls) {
        return cls.code === logClassEnum.Sport;
    }).length > 0;
}
