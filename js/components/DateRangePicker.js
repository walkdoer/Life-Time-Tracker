/**
 * @jsx React.DOM
 */
require('../libs/daterangepicker');
var React = require('react');
var Moment = require('moment');

var DateRangePicker = React.createClass({

    componentDidMount: function () {
        var start, end;
        if (this.props.start && this.props.end) {
            start = this.props.start;
            end = this.props.end;
        } else {
            var today = new Moment().format('YYYY-MM-DD');
            start = end = today;
        }
        var that = this;
        var $dateRange = $(this.refs.dateRangeInput.getDOMNode());
        $dateRange.daterangepicker({
            format: 'YYYY-MM-DD'
        }, function(start, end, label) {
            that.setDateRange(start, end, true);
        });
        this.setDateRange(start, end, false);
    },


    componentDidUpdate: function () {
        console.log('update');
        var start = this.props.start,
            end = this.props.end;
        this.setDateRange(start, end, false);
    },

    render: function () {
        var className = 'ltt_c-dateRangePicker';
        if (this.props.className) {
            className += ' ' + this.props.className;
        }
        return (
            <div className={className}>
                <button className="prev" type="button" onClick={this.prevDateRange} title="prev"><i className="fa fa-angle-double-left"></i></button>
                <input ref="dateRangeInput" className="input-daterange"/>
                <button className="next" type="button" onClick={this.nextDateRange} title="next"><i className="fa fa-angle-double-right"></i></button>
            </div>
        );
    },


    setDateRange: function(start, end, trigger) {
        start = Moment(start);
        end = Moment(end);
        var $dateRange = $(this.refs.dateRangeInput.getDOMNode());
        $dateRange.data('daterangepicker').setStartDate(start);
        $dateRange.data('daterangepicker').setEndDate(end);
        if (trigger === true || trigger === undefined) {
            this.props.onDateRangeChange(start.toDate(), end.toDate());
        }
    },

    prevDateRange: function () {
        var start = new Moment(this.props.start),
            end = new Moment(this.props.end),
            diffDay = end.diff(start, 'day') + 1;

        var newStart = Moment(start).subtract(diffDay, 'day').startOf('day');
        var newEnd = Moment(start).subtract(1, 'day').endOf('day');
        this.setDateRange(newStart, newEnd);
    },

    nextDateRange: function () {
        var start = new Moment(this.props.start),
            end = new Moment(this.props.end),
            diffDay = end.diff(start, 'day') + 1;

        var newStart = Moment(end).add(1, 'day').startOf('day'),
            newEnd  = Moment(end).add(diffDay, 'day');
        this.setDateRange(newStart, newEnd);
    },
});

module.exports = DateRangePicker;
