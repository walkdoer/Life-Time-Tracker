/**
 * output sit and stand perspective
 */
'use strict';

var display = require('../../dislpay_data');

exports.dispose = function (result) {
    console.log('===== 站立与坐的时间 =====');
    display.bar(result);
};
