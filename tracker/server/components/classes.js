/**
 *
 */
'use strict';

var scanner = require('../../scanner');
var Q = require('q');
var dayStat = require('../../statists/day');
var dateTypeEnum = require('../../enum/dateType');
var monthOverview = require('../../statists/perspectives/month.overview');
var extend = require('node.extend');
exports.generate = function (options) {
    var deferred = Q.defer();
    scanner.scan(options)
        .then(function (scanResult) {
            scanResult.days.map(function (day) {
                var dayOptions = extend({}, options, {
                    dateStr: day.date,
                    dateType: dateTypeEnum.Day
                });
                var statResult = dayStat.dispose(dayOptions, day);
                return extend(day, statResult);
            });
            return scanResult.days;
        }).then ( function (days) {
            deferred.resolve(monthOverview.groupTimeByClass(days));
        });
    return deferred.promise;
};
