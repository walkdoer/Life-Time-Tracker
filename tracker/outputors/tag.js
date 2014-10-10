
'use strict';

var display = require('../dislpay_data');

exports.dispose = function (result) {
    console.log('===== 标签列表 =====');
    display.bar(result, {
        label: 'name',
        count: 'time',
        order: 'desc'
    });
};
