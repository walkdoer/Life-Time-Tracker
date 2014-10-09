/**
 * output the stat result
 */

'use strict';

var dateTypeEnum = require('./enum/dateType');
var dayOutput = require('./outputors/day');
var monthOutput = require('./outputors/month');
var multipleDaysOutput = require('./outputors/multipleDays');
var Msg = require('./message');

exports.dispose = function (statResult, options) {
    var outputor = getOutputer(options);
    if (outputor) {
        outputor.dispose(statResult, options);
    } else {
        Msg.error('can find corresponding outputor');
    }
};


function getOutputer(options) {

    var dateItems = options.dateItems;
    var dateItemLen;
    if (!dateItems) {
        dateItemLen = -1;
    } else {
        dateItemLen = dateItems.length;
    }
    if (dateItemLen === 1 ) {
        var dateType = dateItems[0].type;
        if (dateType === dateTypeEnum.Day) {
            return dayOutput;
        } else if (dateType === dateTypeEnum.Month) {
            return monthOutput;
        } else if (dateType === dateTypeEnum.Year) {
            return multipleDaysOutput;
        }
    } else if (dateItemLen > 1){
        return multipleDaysOutput;
    }

    if (options.dateRange) {
        return multipleDaysOutput;
    }
    return null;
}
