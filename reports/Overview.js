/**
 * @jsx React.DOM
 */

var React = require('react');
var Moment = require('moment');
var Q = require('q');
var _ = require('lodash');

/** Components */
var ReportDateConfig = require('../components/ReportDateConfig');

/** utils */
var DataAPI = require('../utils/DataAPI');

/* Reports */
var DayReport = require('./DayReport');
var MultiDayReport = require('./MultiDayReport');

/** const **/
var DATE_FORMAT = 'YYYY-MM-DD';

var Overview = React.createClass({

    getInitialState: function () {
        var today = new Moment().format('YYYY-MM-DD');
        return {
            start: today,
            end: today,
            compare: false,
            compareStart: null,
            compareEnd: null
        };
    },

    getUrl: function () {
        var mStart = new Moment(this.state.start),
            mEnd = new Moment(this.state.end);
        if (this.isSingleDay()) {
            return '/api/stats/' + (mStart.format('YYYY/MM/DD'));
        } else {
            return '/api/stats?start=' + mStart.format('YYYY-MM-DD') +
                        '&end=' + mEnd.format('YYYY-MM-DD');
        }
    },

    render: function () {
        if (this.isSingleDay()) {
            report = (<DayReport ref="report" compare={this.state.compare}/>);
        } else {
            report = (<MultiDayReport ref="report"  compare={this.state.compare}/>);
        }
        return (
            <div className="ltt_c-report ltt_c-report-overview">
                <ReportDateConfig
                    start= {this.state.start}
                    end= {this.state.end}
                    compareStart= {this.state.compareStart}
                    compareEnd={this.state.compareEnd}
                    compare={this.state.compare}
                    onCompare={this.onCompare}
                    onDateRangeChange={this.onDateRangeChange}
                    onCompareDateRangeChange={this.onCompareDateRangeChange}
                    className="ltt_c-page-reports-dateRange"/>
                {report}
            </div>
        );
    },

    onCompare: function (checked) {
        var mStart = new Moment(this.state.start),
            mEnd = new Moment(this.state.end),
            dayDiff = mEnd.diff(mStart, 'day') + 1;
        var compareEnd = Moment(mStart).subtract(1, 'day').endOf('day'),
            compareStart = Moment(mStart).subtract(dayDiff, 'day');
        this.setState({
            compare: checked,
            compareStart: compareStart.format(DATE_FORMAT),
            compareEnd: compareEnd.format(DATE_FORMAT)
        });
    },

    onDateRangeChange: function (start, end) {
        this.setState({
            start: start,
            end: end
        });
    },

    shouldComponentUpdate: function (nextProps, nextState) {
        return this.state !== nextState;
    },

    onCompareDateRangeChange: function (start, end) {
        this.setState({
            compareStart: start,
            compareEnd: end
        });
    },

    componentDidMount: function () {
        this.renderReport();
    },

    componentDidUpdate: function () {
        this.renderReport();
    },

    renderReport: function (start, end) {
        var that = this;
        this.loadReportData()
            .then(function (result) {
                if (!that.state.compare) {
                    var statData = result.data;
                    that.refs.report.setData(statData);
                } else {
                    that.refs.report.setData(result[0].data);
                    that.refs.report.compareData(result);
                }
            }).catch(function(err) {
                console.error(err.stack);
                throw err;
            });
    },

    loadReportData: function () {
        var def = Q.defer();
        if (!this.state.compare) {
            DataAPI.stat({
                start: new Moment(this.state.start).format(DATE_FORMAT),
                end: new Moment(this.state.end).format(DATE_FORMAT)
            })
            .then(function (result) {
                def.resolve({data: result});
            })
            .catch(function (err) {
                def.reject(err);
            });
        } else {
            Q.allSettled([
                DataAPI.stat({
                    start: new Moment(this.state.start).format(DATE_FORMAT),
                    end: new Moment(this.state.end).format(DATE_FORMAT)
                }),

                DataAPI.stat({
                    start: new Moment(this.state.compareStart).format(DATE_FORMAT),
                    end: new Moment(this.state.compareEnd).format(DATE_FORMAT)
                })
            ]).then(function (promises) {
                promises = promises.filter(function (promise) {
                    return promise.state === "fulfilled";
                });
                if (promises.length < 2) {
                    console.log('加载数据出错');
                    def.reject({
                        msg: 'load compare data fail, data not complete'
                    });
                }
                def.resolve(promises.map(function (promise) {
                    return {data: promise.value};
                }));
            });
        }
        return def.promise;
    },

    isSingleDay: function () {
        var mStart = new Moment(this.state.start),
            mEnd = new Moment(this.state.end);
        return mStart.diff(mEnd, 'day') === 0;
    }

});

module.exports = Overview;
