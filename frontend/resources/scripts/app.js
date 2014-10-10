define(function(require, exports) {
    'use strict';
    var d3 = require('d3');
    var CalHeatMap = require('./libs/cal-heatmap');
    var Highcharts = require('highcharts');
    var _ = require('underscore');
    var $ = require('jquery');
    var moment = require('moment');
    var Q = require('q');
    var remoteStorage = require('./components/storage.remote');
    var chart = require('./components/chart');

    //convertors
    var sleepPeriodConvertor = require('./components/convertors/sleepPeriod');
    var classesConvertor = require('./components/convertors/classes');
    var nameTimeConvertor = require('./components/convertors/nameTime');

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
        createProjects();
        createTags();
    };

    function createSportCalendarHeatMap() {
        var calendar = new CalHeatMap();
        d3.json("/api/calendars/sport/2014", function(error, data) {
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
        remoteStorage.get('/api/sleepPeriods/2014')
            .then(function(result) {
                chart.timeline({
                    title: '睡眠曲线',
                    $el: $('#sleepPeriod'),
                    data: sleepPeriodConvertor.dispose(result.data)
                });
            });
    }

    function createClassesPie() {
        var today = new moment();
        var year = today.year(),
            month = today.month() + 1,
            prevMonth = month - 1,
            lastTwoMonth = month - 2;
        Q.allSettled([
            remoteStorage.get(['/api/classes', year, lastTwoMonth].join('/'), {month: lastTwoMonth}),
            remoteStorage.get(['/api/classes', year, prevMonth].join('/'), {month: prevMonth})
        ]).then(function(results) {
            var datas = [];
            results.forEach(function(result, index) {
                if (result.state === 'fulfilled') {
                    var resp = result.value;
                    chart.pie({
                        title: resp.params.month + '月份时间分类',
                        $el: $('.classesPie').eq(index),
                        data: classesConvertor.dispose(resp.data)
                    });
                    datas.push({name: resp.params.month + '月份', data: resp.data});
                }
            });
            return datas;
        }).then(function (datas) {
            //get compare group from the classed time.
            var compareGroup = [];
            var categories = [];
            var allClasses = getAllClasses(datas);
            allClasses.forEach(function (cls) {
                categories.push(cls.label);
            });
            datas.forEach(function (data) {
                var classTimeArr = data.data;
                var groupData = [];
                allClasses.forEach(function (cls) {
                    var result = _.find(classTimeArr, function (classTime) {
                        return classTime.code === cls.code;
                    });
                    if (!result) {
                        groupData.push(0);
                    } else {
                        groupData.push(result.count);
                    }
                });
                compareGroup.push({data: groupData, name: data.name});
            });
            return {
                categories: categories,
                data: compareGroup
            };

            function getAllClasses (datas) {
                var classes = [];
                datas.forEach(function (data) {
                    data.data.forEach(function (classTime) {
                        var result = _.find(classes, function (cls) {
                            return cls.code === classTime.code;
                        });
                        if (!result) {
                            classes.push(classTime);
                        }
                    });
                });

                return classes;
            }
        }).then(function(compareGroup) {
            chart.column({
                title: '对比数据',
                $el: $('.classesCompared'),
                data: compareGroup.data
            }, {
                xAxis: {
                    categories: compareGroup.categories
                }
            });
        }).catch(function (e) {
            throw e;
        });
    }

    function createTags() {
        remoteStorage.get('/api/tags/2014', {top: 20, order: 'desc'})
            .then(function(result) {
                chart.column({
                    title: 'top20标签',
                    $el: $('#tags'),
                    data: nameTimeConvertor.dispose(result.data)
                }, {
                    xAxis: {
                        categories: _.pluck(result.data, 'name')
                    },
                    legend: {
                        enabled: false
                    }
                });
            });
    }
    function createProjects() {
        remoteStorage.get('/api/projects/2014', { top: 20, order: 'desc' })
            .then(function(result) {
                chart.column({
                    title: 'top20项目',
                    $el: $('#projects'),
                    data: nameTimeConvertor.dispose(result.data)
                }, {
                    xAxis: {
                        categories: _.pluck(result.data, 'name'),
                        labels: {
                            rotation: -45,
                            style: {
                                fontSize: '13px',
                                fontFamily: 'Verdana, sans-serif'
                            }
                        }
                    },
                    legend: {
                        enabled: false
                    }
                });
            });
    }
});
