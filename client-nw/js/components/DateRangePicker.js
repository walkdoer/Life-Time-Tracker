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
            format: 'YYYY-MM-DD'
        }, function(start, end, label) {
            that.setDateRange(start, end, true);
        });
        this.setDateRange(start, end, false);
    },


    componentDidUpdate: function () {
        var that = this;
        if (this.props.compare && this.props.compareStart && this.props.compareEnd) {
            var start = this.props.compareStart,
                end = this.props.compareEnd;
            var $compareDateRange = $(this.refs.compareDateRange.getDOMNode());
            $compareDateRange.daterangepicker({
                format: 'YYYY-MM-DD'
            }, function(start, end, label) {
                that.setCompareDateRange(start, end, true);
            });
            this.setCompareDateRange(start, end, false);
        }
    },

    render: function () {
        var className = 'ltt_c-dateRangePicker ' + this.props.className;
        var inputClassName = 'input-daterange';
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
        var compareComponents;
        if (this.props.compare) {
            compareComponents = (<input ref="compareDateRange" className="input-daterange"/>);
        }
        return (
            <div className={className}>
                <div>
                    <input ref="dateRange" className="input-daterange"/>
                    <input ref="isCompared" type="checkbox" onChange={this.onCompare}/>
                    {compareComponents}
                </div>
                <div className="btn-group" role="daterange">{btns}</div>
            </div>
        );
    },

    onCompare: function (e) {
        var checked = e.target.checked;
        this.props.onCompare(checked);
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
            this.props.onDateRangeChange(start.toDate(), end.toDate());
        }
    },

    setCompareDateRange: function (start, end, trigger) {
        start = Moment(start);
        end = Moment(end);
        var $compareDateRange = $(this.refs.compareDateRange.getDOMNode());
        $compareDateRange.data('daterangepicker').setStartDate(start);
        $compareDateRange.data('daterangepicker').setEndDate(end);
        this.setStartDate(start);
        this.setEndDate(end);
        if (trigger) {
            this.props.onCompareDateRangeChange(start.toDate(), end.toDate());
        }
    }

});

module.exports = DateRangePicker;
