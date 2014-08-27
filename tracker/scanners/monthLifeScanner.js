/**
 * life scanner
 *
 * scan all the logs from the log file, and transform into Log Object
 * including all the aspect of life, work,study,think,break,sport
 */

'use strict';

var msg = require('../message'),
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
    fileData.days.forEach(function (day) {
        day.logs = helper.getLogs(day.fileContent, day.date);
        day.logs = scannerHelper.filterClass(day.data, options);
    });
    return fileData;
}
