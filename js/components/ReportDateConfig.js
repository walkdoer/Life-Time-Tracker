/**
 * @jsx React.DOM
 */
require('../libs/daterangepicker');
var React = require('react');
var Moment = require('moment');
var DateRangePicker = require('./DateRangePicker');

var ReportDateConfig = React.createClass({

    render: function () {
        var className = 'ltt_c-reportDateConfig ' + this.props.className;
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
            compareComponents = (
                <DateRangePicker ref="compareDateRange" start={this.props.compareStart} end={this.props.compareEnd}
                    onDateRangeChange={this.props.onCompareDateRangeChange}/>
            );
        }
        return (
            <div className={className}>
                <div className="ltt_c-reportDateConfig-dateRange">
                    <DateRangePicker ref="dateRange" start={this.props.start} end={this.props.end}
                        onDateRangeChange={this.props.onDateRangeChange}/>
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
            this.props.onDateRangeChange(mStart.toDate(), mEnd.toDate());
        }
    }

});

module.exports = ReportDateConfig;
