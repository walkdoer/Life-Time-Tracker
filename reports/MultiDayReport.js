/**
 * @jsx React.DOM
 */

var React = require('react');
var Moment = require('moment');
var Q = require('q');
var _ = require('lodash');
var col4 = 'col-xs-6 col-md-4',
    col8 = 'col-xs-12 col-md-8',
    colFull = 'col-xs-12 col-md-12',
    col3 = 'col-xs-6 col-md-3';

//charts
var Pie = require('../components/charts/Pie');
var Column = require('../components/charts/Column');
var Line = require('../components/charts/Line');
var Bar = require('../components/charts/Bar');
var BubbleCloud = require('../components/charts/BubbleCloud');
var setAndCompareData = require('../components/charts/setAndCompareData');
var config = require('../conf/config');

function getClassName(clsId) {
    var classes = config.classes;
    var cls = classes.filter(function (cls) {
        return cls._id === clsId;
    })[0];
    if (cls) {
        return cls.name;
    } else {
        return null;
    }
}
var Report = React.createClass({

    mixins: [setAndCompareData],

    chartDatas: {
        chart_logClassTime: function (result) {
            var data = result.classTime;
            return data.map(function (item) {
                var name = getClassName(item.id);
                if (name) {
                    item.label = name;
                }
                return item;
            });
        },
        chart_logClassTimeTrend: function (data) { return this.getLogClassTimeTrend(data); },
        chart_tagTimeTrend: function (data) { return this.getTagTimeTrend(data); },
        chart_projectTimeTrend: function (data) { return this.getProjectTimeTrend(data); },
        chart_tagTime: function (data) { return data.tagTime.slice(0, 20); },
        chart_sitStandTime: function (data) { return data.sitPerspective;},
        chart_categoryTime: function (data) { return data.categoryPerspective.categoryTime; },
        chart_projectTime: function (data) { return  data.projectTime.slice(0,10);},
        chart_meanLogClassTime: function (data) {
            return _.map(data.meanPerspective.classes, function (value, classId) {
                var label = getClassName(classId) || classId;
                return {
                    label: label,
                    value: value
                };
            });
        },
        chart_activeTime: function (data) {
            var trackedTime = [], unTrackedTime = [], sleepTime = [];
            var days = data.days;
            days.forEach(function (day) {
                var dateTS = new Moment(day.date).unix() * 1000;
                var activeTime = day.activeTime;
                unTrackedTime.push([dateTS, activeTime - day.trackedTime]);
                sleepTime.push([dateTS, day.sleepTime]);
                trackedTime.push([dateTS, day.trackedTime]);
            });
            return [
                /*{ name: 'Sleep Time', data: sleepTime},取消sleepTime，这样更加易读*/
                { name: 'Tracked Time', data: trackedTime},
                { name: 'unTracked Time', data: unTrackedTime}
            ];
        },
        chart_meanProjectTime: function (data) {
            var n = 8;
            //pick the top N project;
            var meanProjectTime = data.meanPerspective.projects;
            var tops = _.keys(meanProjectTime).slice(0, n);
            return _.pick(meanProjectTime, tops);
        },
        chart_bubbleCloud: function (data) { return data.tagTime; }
    },
    compareChartRefs: [{
        refName: "chart_categoryTime",
        getData: function (data) {
            return data.categoryPerspective.categoryTime;
        },
    }, {
        refName: "chart_tagTime",
        getData: function (data) {
            return data.tagTime.slice(0, 20);
        }
    }, {
        refName: "chart_projectTime",
        getData: function (data) {
            return data.projectTime.slice(0, 10);
        }
    }, {
        refName: "chart_meanLogClassTime",
        getData: function (data) {
            return data.meanPerspective.classes;
        }
    }, {
        refName: "chart_meanProjectTime",
        getData: function (data) {
            return data.meanPerspective.projects;
        }
    }],
    render: function () {
        var baseClass = 'row ltt-row';
        return (
            <div className="ltt_c-report-multiDay">
                <div className={baseClass}>
                    <Pie className={col4} ref="chart_logClassTime" />
                    <Column title="Tag Time" className={col8} ref="chart_tagTime" legend={false} />
                </div>
                <div className={baseClass}>
                    <Line title="Class time trend" type="area" className={colFull} ref="chart_logClassTimeTrend" />
                </div>
                <div className={baseClass}>
                    <Line title="Tag time trend" type="area" className={colFull} ref="chart_tagTimeTrend" visibleCount={4}/>
                </div>
                <div className={baseClass}>
                    <Bar className={col4} ref="chart_categoryTime" />
                    <Column title="Top 10 Project" className={col8} ref="chart_projectTime" />
                </div>
                <div className={baseClass}>
                    <Line title="Project time trend" type="area" className={colFull} ref="chart_projectTimeTrend" visibleCount={4}/>
                </div>
                <div className={baseClass}>
                    <Column title="Active Time" type="stack" className={colFull} ref="chart_activeTime" xAxis="datetime" convert={false}/>
                </div>
                <div className={baseClass}>
                    <Pie className={col4} ref="chart_sitStandTime" />
                    <Bar className={col4} title="Mean Class Time" ref="chart_meanLogClassTime" legend={false} />
                    <Bar className={col4} title="Mean Top 8 Project Time" ref="chart_meanProjectTime" legend={false} />
                </div>
                <div className={baseClass}>
                    <BubbleCloud
                        className={colFull}
                        title="Tag Cloud"
                        ref="chart_bubbleCloud"/>
                </div>
            </div>
        );
    },

    getTagTimeTrend: function (statData) {
        return this.getTrend(statData, {
            dataName: 'tagTime',
            labelName: 'label',
            countName: 'count'
        });
    },


    getLogClassTimeTrend: function (statData) {
        return this.getTrend(statData, {
            dataName: 'classes',
            labelName: 'name',
            countName: 'time'
        });
    },

    getProjectTimeTrend: function (statData) {
        return this.getTrend(statData, {
            dataName: 'projectTime',
            labelName: 'label',
            countName: 'count'
        });
    },

    getTrend: function (statData, options) {
        var dataName = options.dataName;
        var labelName = options.labelName;
        var countName = options.countName;
        var days = statData.days;
        if (_.isEmpty(days)) {
            return [];
        }
        var result = {};
        days.forEach(function (day) {
            day[dataName].forEach(function (item) {
                var name = item[labelName];
                if (!result[name]) {
                    result[name] = [];
                }
            });
        });
        days.forEach(function (day) {
            var dateTS = new Moment(day.date).unix() * 1000;
            var datas = day[dataName];
            _.each(result, function (data, name) {
                var target = datas.filter(function (item) {
                    return item[labelName] === name;
                })[0];
                if (target && target[countName]) {
                    data.push([dateTS, Math.round(target[countName] / 60 * 100)/100]);
                } else {
                    data.push([dateTS, 0]);
                }
            });
        });
        return _.map(result, function (data, key) {
            return {
                name: getClassName(key) || key,
                data: data
            };
        });
    }
});

module.exports = Report;
