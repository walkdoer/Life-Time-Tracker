/**
 * import logs to database
 */

'use strict';

var scanner = require('./scanner');
var Q = require('q');
var Log = require('./model/log');
var syncNoteSig = require('./globalSignals').syncNote;
var Msg = require('./message');
var _ = require('lodash');

//import note to database after sync success;
syncNoteSig.add(function (files) {
    importFromLogFile({
        files: files
    });
});

function importFromLogFile(options) {
    var deferred = Q.defer();
    //scan the data
    scanner.scan(options)
        //ite to database
        .then(function (scanResult) {
            var days = scanResult.days || [scanResult];

            days.forEach(function (day) {
                importDay(day);
            });
        }).then(function () {
            Msg.success('logs have been imported into database successfully.');
        }).catch(function (err) {
            Msg.error('Something wrong happen when imported logs into database.');
            throw err;
        });
    return deferred.promise;
}



function importDay(day) {
    var logs = day.logs;
    var date = day.date;
    if (_.isEmpty(logs)) {
        Msg.warn('[import log]' + date + '\'s have no log');
        return;
    }

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

exports.importFromLogFile = importFromLogFile;
