/**
 * @jsx React.DOM
 */

var React = require('react');
var DateRangePicker = require('../components/DateRangePicker');
var Moment = require('moment');
var Q = require('q');
var _ = require('lodash');
var remoteStorage = require('../components/storage.remote');

/* Reports */
var DayReport = require('../reports/DayReport');
var MultiDayReport = require('../reports/MultiDayReport');

/** const **/
var DATE_FORMAT = 'YYYY-MM-DD';

var Report = React.createClass({

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
            report = (<DayReport ref="report"/>);
        } else {
            report = (<MultiDayReport ref="report"/>);
        }
        return (
            <div className="ltt_c-page-reports">
                <DateRangePicker
                    start= {this.state.start}
                    end= {this.state.end}
                    compareStart= {this.state.compareStart}
                    compareEnd={this.state.compareEnd}
                    compare={this.state.compare}
                    onCompare={this.onCompare}
                    onDateRangeChange={this.onDateRangeChange}
                    onCompareDateRangeChange={this.onCompareDateRangeChange}
                    className="ltt_c-page-reports-dateRange"
                    ref="dateRangePicker"/>
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
                    that.refs.report.compareData(result);
                }
            }).catch(function(err) {
                console.error(err.stack);
                throw err;
            });
    },

    loadReportData: function () {
        var def = Q.defer();
        var api = '/api/stats';
        if (!this.state.compare) {
            remoteStorage.get(api, {
                    start: new Moment(this.state.start).format(DATE_FORMAT),
                    end: new Moment(this.state.end).format(DATE_FORMAT)
                })
                .then(function (result) {
                    def.resolve(result);
                })
                .catch(function (err) {
                    def.reject(err);
                });
        } else {
            Q.allSettled([
                remoteStorage.get(api, {
                    start: new Moment(this.state.start).format(DATE_FORMAT),
                    end: new Moment(this.state.end).format(DATE_FORMAT)
                }),

                remoteStorage.get(api, {
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
                    return promise.value;
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

module.exports = Report;
