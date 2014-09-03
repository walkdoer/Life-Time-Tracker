/**
 * default outputor
 * if there is no outputor for a specific perspective,then would use the
 * default outputor to visualize data.
 */
'use strict';

var display = require('../dislpay_data');

exports.dispose = function (result) {
    console.log('===== 输出数据 =====');
    display.bar(result);
};
