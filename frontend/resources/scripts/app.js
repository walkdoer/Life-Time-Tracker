define(function(require, exports) {
    'use strict';
    var d3 = require('d3');
    var CalHeatMap = require('./libs/cal-heatmap');
    var Highcharts = require('highcharts');
    var $ = require('jquery');
    var moment = require('moment');
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
        $.get('/sleepPeriods/2014')
            .done(function(result) {
                var data = toHighchartsData(result);
                drawLine(data, {
                    $el: $('#sleepPeriod')
                });
            });

        function toHighchartsData(rawData) {
            var wakeLine = {
                name: 'wake',
                data: []
            };
            var sleepLine = {
                name: 'sleep',
                data: []
            };
            var sleepTime = {
                name: '睡眠长度',
                type: 'column',
                color: 'rgba(165,170,217,0.5)',
                yAxis: 1,
                tooltip: {
                    valueSuffix: 'hours',
                    pointFormat: '<span style="color:{series.color}">\u25CF</span> {series.name}: <b>{point.y:.1f}</b><br/>'
                },
                data: []
            };
            var wakeData = wakeLine.data;
            var sleepData = sleepLine.data;
            var sleepTimeData = sleepTime.data;
            var midnight = moment().startOf('day').unix() * 1000;
            rawData.forEach(function(day) {
                var dateTS = moment(day.date).unix() * 1000;
                var wakeMoment = new moment(day.wakeMoment);
                var sleepMoment = new moment(day.sleepMoment);
                console.log(day.date, sleepMoment.hours(), sleepMoment.minutes());
                wakeData.push([dateTS, getYAxisValue(wakeMoment)]);
                sleepData.push([dateTS, getYAxisValue(sleepMoment)]);
                sleepTimeData.push([dateTS, day.sleepTime / 60]);


                function getYAxisValue(m) {
                    var hours = m.hours();
                    if (hours >= 0 && hours <= 12) {
                        //next midnight
                        return midnight + m.hours() * 3600000 + m.minutes() * 60000 + 3600000 * 24;
                    } else {
                        return midnight + m.hours() * 3600000 + m.minutes() * 60000;
                    }
                }
            });
            return {
                series: [wakeLine, sleepLine, sleepTime]
            };
        }

        function drawLine(data, options) {
            var highchartsOptions = {
                title: {
                    text: '睡眠曲线'
                },
                xAxis: {
                    type: 'datetime',
                    dateTimeLabelFormats: { // don't display the dummy year
                        millisecond: '%H:%M:%S.%L',
                        second: '%H:%M:%S',
                        minute: '%H:%M',
                        hour: '%H:%M',
                        day: '%m-%e',
                        week: '%e. %b',
                        month: '%b \'%y',
                        year: '%Y'
                    }
                },
                yAxis: [{
                    title: '', //不需要标题
                    type: 'datetime',
                    dateTimeLabelFormats: { // don't display the dummy year
                        hour: '%H:%M',
                        day: '%H:%M'
                    }
                }, {
                    title: '长度',
                    opposite: true,
                    min: 0,
                    labels: {
                        format: '{value} hours',
                    }
                }],
                tooltip: {
                    //headerFormat: '<b>{series.name}</b><br>',
                    //pointFormat: '{point.x:%m-%e}: {point.y:%H:%m}',
                    pointFormat: '<span style="color:{series.color}">\u25CF</span> {series.name}: <b>{point.y:%H:%m}</b><br/>',
                    crosshairs: true,
                    shared: true
                },

                legend: {
                    itemStyle: {
                        fontFamily: '微软雅黑'
                    }
                },
                series: data.series
            };
            /*
            if (options.granularity === 'day') {
                highchartsOptions.xAxis.tickInterval = 24 * 3600 * 1000;
            }*/
            options.$el.highcharts(highchartsOptions);
        }
    }
});
