
/**
 * 输出运动日志
 */
'use strict';

var display = require('../dislpay_data');

exports.dispose = function (result) {
    preprocessResult(result);
    console.log('运动次数:' + result.count);
    console.log('一共花了' + (result.time / 60).toFixed(1) + 'h 在健身');

    console.log('\n======= 按照健身项目分类=========\n');
    display.bar(result.sportTypeTime);
    console.log('\n======= 运动项目详情=========\n');
    display.table(transformToTable(result.sportItemSum));
};

function preprocessResult(result) {
    result.sportTypeTime.map(function (item) {
        item.label = item.type.cn;
        return item;
    });
}

function transformToTable(sportItemSum) {
    var table = {
            head: ['Sport Item', 'Sets', 'Reps'],
            colWidths: [200, 100, 100]
        },
        //table data
        data = [];
    var keys = Object.keys(sportItemSum);
    keys.forEach(function (key) {
        var item = sportItemSum[key];
        data.push([key, item.sets, item.reps]);
    });
    table.data = data;
    return table;
}
