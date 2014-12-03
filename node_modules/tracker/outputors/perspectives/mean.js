'use strict';

var display = require('../../dislpay_data');

exports.dispose = function (result) {
    console.log('===== 平均时间 =====');
    display.table(createMeanTable('LogClass',result.classes));
    display.table(createMeanTable('Tag', result.tags));
};

function createMeanTable(name, data) {
    var bars = display.getBar(data, {
        maxLen: 50,
        color: 'blue'
    });
    var table = {
            head: ['Mean ' + name + ' Time', 'Bar', 'Percents', 'Time'],
        },
        //table data
        tableData = [];
    bars.forEach(function (item) {
        tableData.push([
            item.label, item.bar,
            (item.percent * 100).toFixed(1) + '%',
            getTime(item.count)
        ]);
    });
    table.data = tableData;
    return table;
}

function getTime(time) {
    return time < 60 ? Math.round(time) + 'm' : (time / 60).toFixed(1) + 'h';
}
