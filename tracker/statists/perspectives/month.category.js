/**
 * sit perspective
 *
 * see how many time I sit one day or one period,like one week or one month.
 */
'use strict';

var dayCategory = require('./day.category');

exports.focus = function (options, scanResult) {
    var days = scanResult.days;
    var logs = [];
    days.forEach(function (day) {
        logs = logs.concat(day.logs);
    });
    return dayCategory.focus(options, {logs: logs});
};
