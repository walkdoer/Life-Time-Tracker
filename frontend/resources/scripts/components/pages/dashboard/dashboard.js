define(function(require, exports) {
    'use strict';
    var d3 = require('d3');
    var CalHeatMap = require('scripts/libs/cal-heatmap');
    var _ = require('underscore');
    var $ = require('jquery');
    var moment = require('moment');
    var Q = require('q');
    var remoteStorage = require('../../storage.remote');
    var chart = require('../../chart');
    var React = require('react');
    var R = React.DOM;

    //convertors
    var sleepPeriodConvertor = require('../../convertors/sleepPeriod');
    var classesConvertor = require('../../convertors/classes');
    var nameTimeConvertor = require('../../convertors/nameTime');
    var layoutHTML = require('!text!./dashboard.html');



    exports.initialize = function() {
        //create calendar heatmap for sport time
        React.renderComponent(R.div({
            className: 'ltt_c-dashboard'
        }), $('.container')[0], function () {
            $(this.getDOMNode()).append(layoutHTML);
            createSleepPeriodLine();
            createClassesPie();
            createProjects();
            createTags();
        });
    };



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
                categories.push(cls.name);
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
                        groupData.push(result.time);
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
