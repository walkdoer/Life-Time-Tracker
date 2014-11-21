/**
 * @jsx React.DOM
 */

var React = require('react');
var DateRangePicker = require('../components/DateRangePicker');
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
var Report = React.createClass({

    getUrl: function () {
        var mStart = new Moment(this.start),
            mEnd = new Moment(this.end);
        if (this.isSingleDay()) {
            return '/api/stats/' + (mStart.format('YYYY/MM/DD'));
        } else {
            return '/api/stats?start=' + mStart.format('YYYY-MM-DD') +
                        '&end=' + mEnd.format('YYYY-MM-DD');
        }
    },


    render: function () {
        if (!this.isSingleDay()) {
            var logClassTimeTrend = (
                    <div className="row ltt-row">
                        <Line title="Class time trend" type="area" className={colFull} ref="logClassTimeTrend" />
                    </div>
                )
        }
        return (
            <div className="ltt_c-page-reports">
                <DateRangePicker onChange={this.renderReport} className="ltt_c-page-reports-dateRange"/>
                <div className="row ltt-row">
                    <Pie className={col4} ref="logClassTime" />
                    <Column className={col8} ref="tagTime" />
                </div>
                {logClassTimeTrend}
                <div className="row ltt-row">
                    <Bar className={col4} ref="categoryTime" />
                    <Column title="Top 10 Project" className={col8} ref="projectTime" />
                </div>
                <div className="row ltt-row">
                    <Pie className={col4} ref="sitStandTime" />
                    <Bar className={col4} ref="meanLogClassTime" />
                    <Bar className={col4} ref="meanProjectTime" />
                </div>
            </div>
        );
    },

    renderReport: function (start, end) {
        var that = this;
        this.setDateRange(start, end);
        this.loadReportData()
            .then(function (result) {
                var statData = result.data;
                that.refs.logClassTime.setData(statData.classTime);
                if (!that.isSingleDay()) {
                    that.refs.logClassTimeTrend.setData(that.getLogClassTimeTrend(statData));
                }
                that.refs.sitStandTime.setData(statData.sitPerspective);
                that.refs.tagTime.setData(statData.tagTime.slice(0, 20));
                that.refs.categoryTime.setData(statData.categoryPerspective.categoryTime);
                that.refs.projectTime.setData(statData.projectTime.slice(0,10));
                if (statData.meanPerspective) {
                    that.refs.meanLogClassTime.setData(statData.meanPerspective.classes);
                    that.refs.meanProjectTime.setData(statData.meanPerspective.projects);
                }
            }).catch(function(err) {
                console.error(err.stack);
                throw err;
            });
    },

    setDateRange: function (start, end) {
        this.start = start;
        this.end = end;
    },

    loadReportData: function () {
        var def = Q.defer();
        var url = this.getUrl();
        remoteStorage.get(url)
            .then(function (result) {
                def.resolve(result);
            })
            .catch(function (err) {
                def.reject(err);
            });
        return def.promise;
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
    },

    isSingleDay: function () {
        var mStart = new Moment(this.start),
            mEnd = new Moment(this.end);
        return mStart.diff(mEnd, 'day') === 0;
    }

});

module.exports = Report;
