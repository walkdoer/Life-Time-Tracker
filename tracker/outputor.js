/**
 * output the stat result
 */

'use strict';

var dateTypeEnum = require('./enum/dateType');
var dayOutput = require('./outputors/day');
var monthOutput = require('./outputors/month');

exports.dispose = function (statResult) {
    var options = statResult.options;

    if (options.dateType === dateTypeEnum.Day) {
        dayOutput.dispose(statResult);
    } else if (options.dateType === dateTypeEnum.Month) {
        monthOutput.dispose(statResult);
    }
};
