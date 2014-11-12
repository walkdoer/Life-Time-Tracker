/**
 * @jsx React.DOM
 */

var React = require('react');
var DateRangePicker = require('../components/DateRangePicker');
var Moment = require('moment');
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
    },

    setDateRange: function (start, end) {
        this.start = start;
        this.end = end;
    },

    loadReportData: function () {
        var url = this.getUrl();
    }

});

module.exports = Report;
