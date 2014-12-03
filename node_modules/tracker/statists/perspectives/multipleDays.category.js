/**
 * time category
 *
 * first: creative activities, like work, study, thinking, meditation, sport
 * second: shopping, eatting
 * third: normal thing,like watch drama
 *
 * the reason to calculate category time is to optimize my time usage, spent the time in the most valuable thing.
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
