/**
 * @jsx React.DOM
 */

var React = require('react');
var DateRangePicker = require('../components/DateRangePicker');
var Report = React.createClass({

    render: function () {
        return (
            <div className="ltt_c-page-reports">
                <DateRangePicker onChange={this.renderReport} className="ltt_c-page-reports-dateRange"/>
            </div>
        );
    },

    renderReport: function (start, end) {
        var mStart = new Moment(start),
            mEnd = new Moment(end);
        if (mStart.diff(mEnd, 'day') === 0) {
            
        }
    }

});

module.exports = Report;
