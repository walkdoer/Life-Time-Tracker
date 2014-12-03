/**
 * output sit and stand perspective
 */
'use strict';

var display = require('../../dislpay_data');

exports.dispose = function (result) {
    console.log('===== 时间归类（第一大类，第二大类 第三大类） =====');
    var categoryTime = result.categoryTime;
    var bars = display.getBar(categoryTime, {
        //the max bar length, in case that is too long
        maxLen: 50,
        color: 'magenta'
    });
    var table = {
            head: ['Time Category', 'Bar', 'Percents', 'Time'],
        },
        //table data
        data = [];
    bars.forEach(function (item) {
        data.push([item.label, item.bar, (item.percent * 100).toFixed(1) + '%', item.count]);
    });
    table.data = data;
    display.table(table);
};
