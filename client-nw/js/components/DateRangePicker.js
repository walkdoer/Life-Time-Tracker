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
        var $dateRange = $(this.refs.dateRange.getDOMNode());
        $dateRange.daterangepicker({
            format: 'YYYY-MM-DD',
            startDate: '2013-01-01',
            endDate: '2013-12-31'
        }, function(start, end, label) {
            that.setDateRange(start, end, true);
        });
        this.setDateRange(start, end, false);
    },


    render: function () {
        var className = 'input-daterange input-group ' + this.props.className;
        var btns = [
            {text: 'Today', value: 'today'},
            {text: 'Yesterday', value: 'yesterday'},
            {text: 'Weekly', value: 'weekly'},
            {text: 'Monthly', value: 'monthly'},
            {text: 'Annual', value: 'annual'}
        ].map(function (btn) {
            return (<button type="button" className="btn btn-default"
                onClick={this.setDateRangeType.bind(this, btn.value)}>{btn.text}</button>);
        }, this);
        return (
            <div className="ltt_c-dateRangePicker">
                <input ref="dateRange" className={className}/>
                <div className="btn-group" role="daterange">{btns}</div>
            </div>
        );
    },

    getStartDate: function () {
        return this._start;
    },

    setStartDate: function (date) {
        this._start = date;
    },

    getEndDate: function () {
        return this._end;
    },

    setEndDate: function (date) {
        this._end = date;
    },

    clearDateRange: function () {
        this.setEndDate (null);
        this.setStartDate(null);
    },

    setDateRangeType: function (rangeType) {
        var mStart, mEnd, mNow = new Moment();
        switch (rangeType) {
            case 'today':
                mStart = Moment(mNow).startOf('day');
                mEnd = Moment(mNow).endOf('day');
                break;
            case 'yesterday':
                mNow.subtract(1, 'day');
                mStart = Moment(mNow).startOf('day');
                mEnd = Moment(mNow).endOf('day');
                break;
            case 'weekly':
                mStart = Moment(mNow).startOf('week');
                mEnd = Moment(mNow).endOf('week');
                break;
            case 'monthly':
                mStart = Moment(mNow).startOf('month');
                mEnd = Moment(mNow).endOf('month');
                break;
            case 'annual':
                mStart = Moment(mNow).startOf('year');
                mEnd = Moment(mNow).endOf('year');
                break;
        }
        if (mStart && mEnd) {
            this.clearDateRange();
            this.setDateRange(mStart, mEnd, true);
        }
    },

    setDateRange: function(start, end, trigger) {
        start = Moment(start);
        end = Moment(end);
        var $dateRange = $(this.refs.dateRange.getDOMNode());
        $dateRange.data('daterangepicker').setStartDate(start);
        $dateRange.data('daterangepicker').setEndDate(end);
        this.setStartDate(start);
        this.setEndDate(end);
        if (trigger) {
            this.props.onChange(start.toDate(), end.toDate());
        }
    }

});

module.exports = DateRangePicker;
