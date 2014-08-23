/**
 * output the stat result
 */

'use strict';

var dateTypeEnum = require('./enum/dateType');
var dayOutput = require('./outputors/day');
var monthOutput = require('./outputors/month');
var sportOutput = require('./outputors/sport');
var logClassEnum = require('./enum/logClass');

exports.dispose = function (options, statResult) {

    if (options.logClass === logClassEnum.NormalThing) {
        if (options.dateType === dateTypeEnum.Day) {
            dayOutput.dispose(statResult, options);
        } else if (options.dateType === dateTypeEnum.Month) {
            monthOutput.dispose(statResult, options);
        }
    } else if (options.logClass === logClassEnum.Sport) {
        sportOutput.dispose(statResult, options);
    }
};
