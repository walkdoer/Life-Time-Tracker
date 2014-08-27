/**
 * output the stat result
 */

'use strict';

var dateTypeEnum = require('./enum/dateType');
var dayOutput = require('./outputors/day');
var monthOutput = require('./outputors/month');

exports.dispose = function (options, statResult) {
    if (options.dateType === dateTypeEnum.Day) {
        dayOutput.dispose(statResult, options);
    } else if (options.dateType === dateTypeEnum.Month) {
        monthOutput.dispose(statResult, options);
    }
};
