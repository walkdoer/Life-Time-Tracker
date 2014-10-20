define(function (require, exports) {

    'use strict';

    var Highcharts = require('highcharts');
    //在这里添加highchart的全局设置
    Highcharts.setOptions({
        global: {
            useUTC: false
        },
        plotOptions: {
            series: {
                // animation: false
            }
        }
    });

    var router = require('./router');
    exports.initialize = function () {
        router.start();
    };

});
