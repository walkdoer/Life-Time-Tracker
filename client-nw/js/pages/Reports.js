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

var Report = React.createClass({

    getInitialState: function () {
        var today = new Moment().format('YYYY-MM-DD');
        return {
            start: today,
            end: today
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
                    onChange={this.onDateRangeChange}
                    className="ltt_c-page-reports-dateRange"/>
                {report}
            </div>
        );
    },


    onDateRangeChange: function (start, end) {
        this.setState({
            start: start,
            end: end
        });
    },

    componentDidMount: function () {
        console.log('componentDidMount');
        this.renderReport();
    },

    componentDidUpdate: function () {
        console.log('componentDidUpdate');
        this.renderReport();
    },

    renderReport: function (start, end) {
        var that = this;
        this.loadReportData()
            .then(function (result) {
                var statData = result.data;
                that.refs.report.setData(statData);
            }).catch(function(err) {
                console.error(err.stack);
                throw err;
            });
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

    isSingleDay: function () {
        var mStart = new Moment(this.state.start),
            mEnd = new Moment(this.state.end);
        return mStart.diff(mEnd, 'day') === 0;
    }

});

module.exports = Report;
