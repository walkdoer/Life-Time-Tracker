'use strict';
var moment = require('moment');

exports.getDateParams = function (dateStr) {
    if (!dateStr) {
        dateStr = moment().format('YYYY-MM');
    }
    var dateRangeSplitter = '~',
        dateItemSplitter = ',';
    var dateRange,
        dateItems;
    //Date Range
    if (dateStr.indexOf(dateRangeSplitter) >= 0) {
        dateRange = {};
        var dateRangeArr = dateStr.split(dateRangeSplitter);
        dateRange.from = toDate(dateRangeArr[0]);
        dateRange.to = toDate(dateRangeArr[1]);
    } else {
        //Date Items
        dateItems = dateStr.split(dateItemSplitter).map(toDate);
    }
    return {
        dateRange: dateRange,
        dateItems: dateItems,
        dateStr: dateStr
    };
};

function toDate(dateStr) {
    var date,
        dateFormat = 'YYYY-MM-DD';
    dateStr = dateStr.toLowerCase(dateFormat);
    if (dateStr === 'today') {
        date = moment().format();
    } else if (dateStr === 'yesterday') {
        date = moment().subtract(1, 'days').format(dateFormat);
    } else {
        date = dateStr;
    }
    var dateType = [null, 'year', 'month', 'day'][date.split('-').length];

    return {
        value: date,
        type: dateType
    };
}
