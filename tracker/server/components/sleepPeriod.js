/**
 * sleep period
 * sleepTime sleep length of one day
 * sleepMoment the time go to bed
 * wakeMoment the time woke
 */
'use strict';

var scanner = require('../../scanner');
var Q = require('q');
var Msg = require('../../message');
var Moment = require('moment');
var dayStat = require('../../statists/day');
var dateTypeEnum = require('../../enum/dateType');
var extend = require('node.extend');
var timeFormat = 'YYYY-MM-DD HH:mm:ss';
exports.generate = function (options) {
    var deferred = Q.defer();
    scanner.scan(options)
        .then(function (scanResult) {
            var result = [];
            scanResult.days.forEach(function (day) {
                var dayOptions = extend({}, options, {
                    dateStr: day.date,
                    dateType: dateTypeEnum.Day
                });
                var statResult = dayStat.dispose(dayOptions, day);
                if (!statResult.sleepMoment) {
                    Msg.error(day.date + 'have no sleepTime');
                }
                if (!statResult.wakeMoment) {
                    Msg.error(day.date + 'have no wakeTime');
                }
                result.push({
                    date: day.date,
                    sleepMoment: new Moment(statResult.sleepMoment).format(timeFormat),
                    wakeMoment: new Moment(statResult.wakeMoment).format(timeFormat),
                    sleepTime: day.sleepTime
                });
            });
            deferred.resolve(result);
        });
    return deferred.promise;
};
