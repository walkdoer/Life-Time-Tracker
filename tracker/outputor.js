/**
 * output the stat result
 */

'use strict';

var dateTypeEnum = require('./enum/dateType');
var dayOutput = require('./outputors/day');
var monthOutput = require('./outputors/month');
var multipleDaysOutput = require('./outputors/multipleDays');

exports.dispose = function (statResult, options) {
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
            dayOutput.dispose(statResult, options);
        } else if (options.dateType === dateTypeEnum.Month) {
            monthOutput.dispose(statResult, options);
        }
    } else if (dateItemLen > 1){
        multipleDaysOutput.dispose(statResult, options);
    }

    if (options.dateRange) {
        multipleDaysOutput.dispose(statResult, options);
    }
};
