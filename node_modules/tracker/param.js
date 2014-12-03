'use strict';
var moment = require('moment');
var dateFormat = require('./timeFormat').date;

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
    var date, dateType;
    dateStr = dateStr.toLowerCase(dateFormat);
    if (dateStr === 'today') {
        date = new moment().format(dateFormat);
    } else if (dateStr === 'yesterday') {
        date = new moment().subtract(1, 'days').format(dateFormat);
    } else {
        dateType = [null, 'year', 'month', 'day'][dateStr.split('-').length];
        var format = {
            year: 'YYYY',
            month: 'YYYY-MM',
            day: 'YYYY-MM-DD'
        };
        date = new moment(dateStr).format(format[dateType]);
    }

    dateType = [null, 'year', 'month', 'day'][date.split('-').length];
    return {
        value: date,
        type: dateType
    };
}
