/**
 * life scanner
 *
 * scan all the logs from the log file, and transform into Log Object
 * including all the aspect of life, work,study,think,break,sport
 */

'use strict';

var dateTypeEnum = require('../enum/dateType'),
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
            day.logs = helper.getLogs(day.fileContent, day.date);
        });
    } else if (options.dateType === dateTypeEnum.Day) {
        var fileContent = fileData.fileContent;
        fileData.logs = helper.getLogs(fileContent, date);
    }
    return fileData;
}
