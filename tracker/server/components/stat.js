
/**
 * stat module
 */
'use strict';

var Q = require('q');
var Msg = require('../../message');
var Moment = require('moment');
var Search = require('../../search/search');
var statist = require('../../statist');


exports.generate = function (options) {
    var deferred = Q.defer();
    Search.query(options)
        .then(function (queryResult) {
            var data = adaptLogs(queryResult);
            var result = statist.dispose(options, data);
            deferred.resolve(result);
        }).catch(function (err) {
            deferred.reject(err);
        });
    return deferred.promise;
};


function adaptLogs(logs) {
    var days = [];

    logs.forEach(function (log) {
        if (!log.date) {
            Msg.error(log.origin + ' doesn\'t have logs');
            return;
        }
        if (log.project) {
            log.projects = [log.project];
        } else {
            log.projects = [];
        }
        var date = new Moment(log.date).format('YYYY-MM-DD');
        var day = getDay(date);
        if (day) {
            day.logs.push(log);
        } else {
            //create day
            days.push({
                date: date,
                logs: [log]
            });
        }
    });

    return {
        days: days
    };

    function getDay(date) {
        return days.filter(function (day) {
            return day.date === date;
        })[0] || null;
    }
}