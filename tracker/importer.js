/**
 * import logs to database
 */

'use strict';

var scanner = require('./scanner');
var Q = require('q');
var Log = require('./model/log');

exports.importFromLogFile = function (options) {
    var deferred = Q.defer();
    //scan the data
    scanner.scan(options)
        //ite to database
        .then(function (scanResult) {
            var days = scanResult.days || [scanResult];

            days.forEach(function (day) {
                importDay(day);
            });
        });
    return deferred.promise;
};



function importDay(day) {
    var logs = day.logs;
    var date = day.date;

    //remove the same day's log before import
    Log.remove({
        date: new Date(day.date)
    }, function (err) {
        if (err) {
            console.error(err);
        }
    });

    logs.forEach(function (log) {
        var logModel = toLogModel(date, log);
        logModel.save(function(err) {
            if (err) {
                console.error(err);
            }
        });
    });
}


function toLogModel(date, log) {
    return new Log({
        date: date,
        start: log.start,
        classes: log.classes,
        end: log.end,
        tags: log.tags,
        projects: log.projects,
        origin: log.origin
    });
}
