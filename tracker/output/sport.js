
/**
 * 输出运动日志
 */
'use strict';

var display = require('../dislpay_data');

function output(result) {
    preprocessResult(result);
    console.log('健身次数:' + result.count);
    console.log('一共花了' + (result.time / 60).toFixed(1) + 'h 在健身');

    console.log('\n======= 按照健身项目分类=========\n');
    display.bar(result.sportItemTime);
}

function preprocessResult(result) {
    result.sportItemTime.map(function (item) {
        item.label = item.type.cn;
        return item;
    });
}


module.exports = output;
