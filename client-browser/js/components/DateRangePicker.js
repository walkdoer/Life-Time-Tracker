/**
 * @jsx React.DOM
 */

var React = require('react');
var Moment = require('moment');

var DateRangePicker = React.createClass({

    componentDidMount: function () {
        var onChange = this.props.onChange;
        var today = new Moment().format('YYYY-MM-DD');
        var that = this;
        $(this.refs.dateRange.getDOMNode()).datepicker({
            todayHighlight: true,
            format: this.props.format || 'yyyy-mm-dd'
        }).on('changeDate', function (e) {
            var target = e.target,
                name = target.name;
            var date = e.date;
            if (name === 'start') {
                that.setStartDate(date);
            } else if (name === 'end') {
                that.setEndDate(date);
            }
            var start = that.getStartDate(),
                end = that.getEndDate();
            if (start && end) {
                onChange(start, end);
            }
        });
        $(this.refs.startDate.getDOMNode()).datepicker('setDate', today);
        $(this.refs.endDate.getDOMNode()).datepicker('setDate', today);
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
                onClick={this.setDateRange.bind(this, btn.value)}>{btn.text}</button>);
        }, this);
        return (
            <div className="ltt_c-dateRangePicker">
                <div ref="dateRange" className={className}>
                    <input ref="startDate" type="text" className="input-sm form-control" name="start" />
                    <span className="input-group-addon">to</span>
                    <input ref="endDate" type="text" className="input-sm form-control" name="end" />
                </div>
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

    setDateRange: function (rangeType) {
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
            $(this.refs.startDate.getDOMNode()).datepicker('setDate', mStart.toDate());
            $(this.refs.endDate.getDOMNode()).datepicker('setDate', mEnd.toDate());
        }
    }

});

module.exports = DateRangePicker;
