/**
 * output the stat result
 */

'use strict';

var dateTypeEnum = require('./enum/dateType');
var dayOutput = require('./outputors/day');
var monthOutput = require('./outputors/month');
var sportOutput = require('./outputors/sport');
var logClassEnum = require('./enum/logClass');

exports.dispose = function (statResult) {
    var options = statResult.options;

    if (options.dateType === dateTypeEnum.Day) {
        dayOutput.dispose(statResult);
    } else if (options.dateType === dateTypeEnum.Month) {
        monthOutput.dispose(statResult);
    } else if (options.logClass === logClassEnum.Sport) {
        sportOutput.dispose(statResult);
    }
};
