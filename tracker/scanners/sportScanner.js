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
    helper = require('./helper'),
    msg = require('../message'),
    helper = require('../helper'),
    when = require('when');

exports.scan = function (options) {
    var deferred = when.defer();
    helper.readLogFile(options)
        .then(extractLogs.bind(null, options))
        .then(function (scanResult) {
            if (options.dateType === dateTypeEnum.Month) {
                scanResult = {
                    days: scanResult
                };
            }
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
    var date = fileData.date,
        fileContent = fileData.fileContent;

    if (options.dateType === dateTypeEnum.Month) {
        fileData.forEach(function (file) {
            file.logs = helper.getLogs(file.fileContent, file.date);
        });
    } else if (options.dateType === dateTypeEnum.Day) {
        fileData.logs = helper.getLogs(fileContent, date);
    }
    return fileData;
}
