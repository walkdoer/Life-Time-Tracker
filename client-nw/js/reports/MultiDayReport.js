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
var compareData = require('../components/charts/compareData');
var Report = React.createClass({

    mixins: [compareData],

    render: function () {
        var baseClass = 'row ltt-row';
        return (
            <div className="ltt_c-report-multiDay">
                <div className={baseClass}>
                    <Pie className={col4} ref="logClassTime" />
                    <Column className={col8} ref="tagTime" />
                </div>
                <div className={baseClass}>
                    <Line title="Class time trend" type="area" className={colFull} ref="logClassTimeTrend" />
                </div>
                <div className={baseClass}>
                    <Bar className={col4} ref="categoryTime" />
                    <Column title="Top 10 Project" className={col8} ref="projectTime" />
                </div>
                <div className={baseClass}>
                    <Pie className={col4} ref="sitStandTime" />
                    <Bar className={col4} ref="meanLogClassTime" />
                    <Bar className={col4} ref="meanProjectTime" />
                </div>
            </div>
        );
    },


    setData: function (statData) {
        var that = this;
        that.refs.logClassTime.setData(statData.classTime);
        that.refs.logClassTimeTrend.setData(that.getLogClassTimeTrend(statData));
        that.refs.sitStandTime.setData(statData.sitPerspective);
        that.refs.tagTime.setData(statData.tagTime.slice(0, 20));
        that.refs.categoryTime.setData(statData.categoryPerspective.categoryTime);
        that.refs.projectTime.setData(statData.projectTime.slice(0,10));
        if (statData.meanPerspective) {
            that.refs.meanLogClassTime.setData(statData.meanPerspective.classes);
            that.refs.meanProjectTime.setData(statData.meanPerspective.projects);
        }
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
