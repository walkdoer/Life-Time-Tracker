/**
 * @jsx React.DOM
 */

var React = require('react');
var Moment = require('moment');
var Q = require('q');
var _ = require('lodash');
var remoteStorage = require('../components/storage.remote');
var col4 = 'col-xs-6 col-md-4',
    col8 = 'col-xs-12 col-md-8',
    colFull = 'col-xs-12 col-md-12',
    col3 = 'col-xs-6 col-md-3';

//charts
var Pie = require('../components/charts/Pie');
var Column = require('../components/charts/Column');
var Line = require('../components/charts/Line');
var Bar = require('../components/charts/Bar');
var setAndCompareData = require('../components/charts/setAndCompareData');
var Report = React.createClass({

    mixins: [setAndCompareData],

    chartDatas: {
        chart_logClassTime: 'classTime',
        chart_logClassTimeTrend: function (data) { return this.getLogClassTimeTrend(data); },
        chart_tagTime: function (data) { return data.tagTime.slice(0, 20); },
        chart_sitStandTime: function (data) { return data.sitPerspective;},
        chart_categoryTime: function (data) { return data.categoryPerspective.categoryTime; },
        chart_projectTime: function (data) { return  data.projectTime.slice(0,10);},
        chart_meanLogClassTime: function (data) { return data.meanPerspective.classes},
        chart_meanProjectTime: function (data) {return data.meanPerspective.projects}
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
            return data.projectTime.slice(0, 20);
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
                    <Column className={col8} ref="chart_tagTime" />
                </div>
                <div className={baseClass}>
                    <Line title="Class time trend" type="area" className={colFull} ref="chart_logClassTimeTrend" />
                </div>
                <div className={baseClass}>
                    <Bar className={col4} ref="chart_categoryTime" />
                    <Column title="Top 10 Project" className={col8} ref="chart_projectTime" />
                </div>
                <div className={baseClass}>
                    <Pie className={col4} ref="chart_sitStandTime" />
                    <Bar className={col4} ref="chart_meanLogClassTime" />
                    <Bar className={col4} ref="chart_meanProjectTime" />
                </div>
            </div>
        );
    },


    getLogClassTimeTrend: function (statData) {
        var days = statData.scanResult.days;
        if (_.isEmpty(days)) {
            return [];
        }
        var result = {};
        days.forEach(function (day) {
            day.classes.forEach(function (cls) {
                if (!result[cls.name]) {
                    result[cls.name] = [];
                }
            });
        });
        days.forEach(function (day) {
            var dateTS = new Moment(day.date).unix() * 1000;
            var classes = day.classes;
            _.each(result, function (data, name) {
                var target = classes.filter(function (cls) {
                    return cls.name === name;
                })[0];
                if (target) {
                    data.push([dateTS, Math.round(target.time / 60 * 100)/100]);
                } else {
                    data.push([dateTS, 0]);
                }
            });
        });
        return _.map(result, function (data, key) {
            return {
                name: key,
                data: data
            };
        });
    }
});

module.exports = Report;
