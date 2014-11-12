/**
 * @jsx React.DOM
 */

var React = require('react');
var DateRangePicker = require('../components/DateRangePicker');
var Moment = require('moment');
var Q = require('q');
var remoteStorage = require('../components/storage.remote');
var Report = React.createClass({

    getUrl: function () {
        var mStart = new Moment(this.start),
            mEnd = new Moment(this.end);
        if (mStart.diff(mEnd, 'day') === 0) {
            return '/api/stats/' + (mStart.format('YYYY/MM/DD'));
        } else {
            return '/api/stats?start=' + mStart.format('YYYY-MM-DD') +
                        '&end=' + mEnd.format('YYYY-MM-DD');
        }
    },

    render: function () {
        return (
            <div className="ltt_c-page-reports">
                <DateRangePicker onChange={this.renderReport} className="ltt_c-page-reports-dateRange"/>
            </div>
        );
    },

    renderReport: function (start, end) {
        this.setDateRange(start, end);
        this.loadReportData()
            .then(function (result) {
                console.log(result);
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
    }

});

module.exports = Report;
