/**
 * sport scanner
 *
 * scan all the sport logs from the log file
 *
 * example: 10:00~11:00 {SPR}[fitness] <push-up:10s6r>
 *
 * and transform into Log Object
 */

'use strict';

var dateTypeEnum = require('../enum/dateType'),
    logClassEnum = require('../enum/logClass'),
    msg = require('../message'),
    helper = require('../helper'),
    scannerHelper = require('./helper'),
    when = require('when');

exports.scan = function (options) {
    var deferred = when.defer();
    scannerHelper.readLogFile(options)
        .then(extractLogs.bind(null, options))
        .then(function (scanResult) {
            scanResult.options = options;
            deferred.resolve(scanResult);
        })
        .catch(function (err) {
            msg.error(err);
            deferred.reject(err);
            //after stable delete this throw err code
            if (err) {
                throw err;
            }
        });
    return deferred.promise;
};




function extractLogs(options, fileData) {
    var date = fileData.date;

    if (options.dateType === dateTypeEnum.Month) {
        fileData.days.forEach(function (day) {
            day.logs = helper.getLogs(day.fileContent, day.date)
                              .filter(sportLog);
        });
    } else if (options.dateType === dateTypeEnum.Day) {
        var fileContent = fileData.fileContent;
        fileData.logs = helper.getLogs(fileContent, date)
                              .filter(sportLog);
    }
    return fileData;
}


/**
 * filter sport logs
 */
function sportLog(log) {
    if (log.classes) {
        return log.classes.filter(function (cls) {
            return cls === logClassEnum.Sport;
        }).length > 0;
    }
    return false;
}
