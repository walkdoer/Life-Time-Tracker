/**
 * life scanner
 *
 * scan all the logs from the log file, and transform into Log Object
 * including all the aspect of life, work,study,think,break,sport
 */

'use strict';

var Msg = require('../message'),
    helper = require('../helper'),
    scannerHelper = require('./helper'),
    _ = require('lodash'),
    when = require('when');

exports.scan = function (options) {
    var deferred = when.defer();
    scannerHelper.readLogFile(options)
        .then(extractLogs.bind(null, options))
        .then(function (scanResult) {
            if (_.isEmpty(scanResult.days)) {
                var error = new Error('缺少日志文件: ' +
                    scanResult.unTrackedDays.join(','));
                Msg.warn(error.message);
                deferred.reject(error);
            }
            scanResult.options = options;
            deferred.resolve(scanResult);
        })
        .catch(function (err) {
            Msg.error(err);
            deferred.reject(err);
        });
    return deferred.promise;
};


function extractLogs(options, fileData) {
    fileData.days.forEach(function (day) {
        day.logs = helper.getLogs(day.fileContent, day.date);
        day.logs = scannerHelper.filterClass(day.logs, options);
    });
    return fileData;
}
