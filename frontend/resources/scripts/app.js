define(function(require, exports) {
    'use strict';
    var d3 = require('d3');
    var CalHeatMap = require('./libs/cal-heatmap');
    var Highcharts = require('highcharts');
    var $ = require('jquery');
    var moment = require('moment');
    var remoteStorage = require('./components/storage.remote');
    var chart = require('./components/chart');
    var sleepPeriodConvertor = require('./components/convertors/sleepPeriod');
    var classesConvertor = require('./components/convertors/classes');
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


    exports.initialize = function() {
        //create calendar heatmap for sport time
        createSportCalendarHeatMap();
        createSleepPeriodLine();
        createClassesPie();
    };

    function createSportCalendarHeatMap() {
        var calendar = new CalHeatMap();
        d3.json("/calendars/sport/2014", function(error, data) {
            var renderData = {};
            data.forEach(function(val) {
                var seconds = new Date(val.date).getTime() / 1000;
                if (val.sportTime > 0) {
                    renderData[seconds] = val.sportTime;
                }
            });
            calendar.init({
                data: renderData,
                start: new Date(2014, 0),
                domain: "month",
                subDomain: "day",
                //subDomainTextFormat: "%d",
                cellSize: 15,
                cellPadding: 2,
                tooltip: true,
                subDomainTitleFormat: {
                    empty: '没有运动数据',
                    filled: '{date} 运动时间 {count}分钟'
                },
                subDomainDateFormat: function(date) {
                    return moment(date).format('D号 dddd');
                }
            });
        });
    }

    function createSleepPeriodLine() {
        remoteStorage.get('/sleepPeriods/2014')
            .then(function(result) {
                chart.timeline({
                    title: '睡眠曲线',
                    $el: $('#sleepPeriod'),
                    data: sleepPeriodConvertor.dispose(result)
                });
            });
    }

    function createClassesPie() {
        var today = new moment();
        var year = today.year(),
            month = today.month() + 1,
            prevMonth = month - 1,
            lastTwoMonth = month - 2;
        remoteStorage.get(['/classes', year, lastTwoMonth].join('/'))
            .then(function(result) {
                chart.pie({
                    title: lastTwoMonth + '月份时间分类',
                    $el: $('#classes-1'),
                    data: classesConvertor.dispose(result)
                });
            });
        remoteStorage.get(['/classes', year, prevMonth].join('/'))
            .then(function(result) {
                chart.pie({
                    title: prevMonth + '月份时间分类',
                    $el: $('#classes-2'),
                    data: classesConvertor.dispose(result)
                });
            });
    }
});
