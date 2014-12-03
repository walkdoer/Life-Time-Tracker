
'use strict';

var display = require('../dislpay_data');

exports.dispose = function (result) {
    console.log('===== Projects =====');
    display.bar(result, {
        label: 'name',
        count: 'time',
        order: 'desc'
    });
};
