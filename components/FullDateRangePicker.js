/**
 * @jsx React.DOM
 */
require('../libs/daterangepicker');
var React = require('react');
var Moment = require('moment');
var DateRangePicker = require('./DateRangePicker');
var RB = require('react-bootstrap');
var ButtonToolbar = RB.ButtonToolbar;
var ButtonGroup = RB.ButtonGroup;
var Button = RB.Button;
var extend = require('extend');
var _ = require('lodash');

/** Utils */
var Util = require('../utils/Util');
function isPeriodEqualDateRange(period, dateRange) {
    var periodDateRange = Util.toDate(period);
    if (dateRange.start && dateRange.end &&
            (new Moment(dateRange.start).diff(periodDateRange.start) !== 0 ||
                new Moment(dateRange.end).diff(periodDateRange.end) !== 0)) {
        return false;
    } else {
        return true;
    }
}
module.exports = React.createClass({
    getInitialState: function () {
        var period = this.props.period;
        var dateRange;
        if (!isPeriodEqualDateRange(period, _.pick(this.props, 'start', 'end'))) {
            period = null;
        }
        if (period) {
            dateRange = this._getDateRangeFromPeriod(period);
        }
        if (this.props.start && this.props.end) {
            dateRange = _.pick(this.props, 'start', 'end');
        }

        this.props.onDateRangeInit(dateRange.start, dateRange.end);

        return extend({
            period: period,
            granularity: this.props.granularity
        }, dateRange);
    },

    getDefaultProps: function () {
        return {
            showCompare: true,
            period: 'today',
            granularity: 'week',
            onDateRangeInit: function () {}
        };
    },


    render: function () {
        var granularity = this.state.granularity;
        var period = this.state.period;
        var className = 'ltt_c-FullDateRangePicker ' + (this.props.className || '');
        var inputClassName = 'input-daterange';
        var compareComponents;
        if (this.props.compare) {
            compareComponents = (
                <DateRangePicker ref="compareDateRange"
                    start={this.props.compareStart}
                    end={this.props.compareEnd}
                    onDateRangeChange={this.props.onCompareDateRangeChange}/>
            );
        }
        return (
            <div className={className}>
                <div className="ltt_c-FullDateRangePicker-dateRange">
                    <DateRangePicker ref="dateRange"
                        start={this.state.start}
                        end={this.state.end}
                        bsSize={this.props.bsSize}
                        granularity={this.state.granularity}
                        onDateRangeChange={this.onDateRangeChange}/>
                    {this.props.showCompare ? <input ref="isCompared" type="checkbox" onChange={this.onCompare}/> : null }
                    {compareComponents}
                </div>
                <ButtonToolbar>
                    <ButtonGroup>
                        {[
                            {label: 'Yesterday', value: 'yesterday'},
                            {label: 'Today', value: 'today'},
                            {label: 'Week', value: 'week'},
                            {label: 'Month', value: 'month'},
                            {label: 'Year', value: 'year'}
                        ].map(function (btn) {
                            return <Button active={period === btn.value} bsSize={this.props.bsSize}
                                onClick={this.onPeriodChange.bind(this, btn.value)}>{btn.label}</Button>;
                        }, this)}
                    </ButtonGroup>
                    <ButtonGroup>
                        {[
                            {label: 'Daily', value: 'day'},
                            {label: 'Weekly', value: 'week'},
                            {label: 'Monthly', value: 'month'},
                            {label: 'Annual', value: 'year'}
                        ].map(function (btn) {
                            return <Button active={btn.value === granularity} bsSize={this.props.bsSize}
                                onClick={this.onGranularityChange.bind(this, btn.value)}>{btn.label}</Button>;
                        }, this)}
                    </ButtonGroup>
                </ButtonToolbar>
            </div>
        );
    },

    onDateRangeChange: function (start, end) {
        if (!isPeriodEqualDateRange(this.state.period, {start:start, end: end})) {
            period = null;
        }
        this.setState({
            start: start,
            end: end,
            period: period
        }, function () {
            this.props.onDateRangeChange(this.state.start, this.state.end);
        });
    },

    onCompare: function (e) {
        var checked = e.target.checked;
        this.props.onCompare(checked);
    },

    onPeriodChange: function (period) {
        var dateRange = this._getDateRangeFromPeriod(period);
        this.setState(extend({
            period: period,
        }, dateRange), function () {
            this.props.onDateRangeChange(this.state.start, this.state.end);
        });
    },

    _getDateRangeFromPeriod: function (period) {
        var mStart, mEnd, mNow = new Moment();
        switch (period) {
            case 'today':
                mStart = Moment(mNow).startOf('day');
                mEnd = Moment(mNow).endOf('day');
                break;
            case 'yesterday':
                mNow.subtract(1, 'day');
                mStart = Moment(mNow).startOf('day');
                mEnd = Moment(mNow).endOf('day');
                break;
            case 'week':
                mStart = Moment(mNow).startOf('week');
                mEnd = Moment(mNow).endOf('week');
                break;
            case 'month':
                mStart = Moment(mNow).startOf('month');
                mEnd = Moment(mNow).endOf('month');
                break;
            case 'year':
                mStart = Moment(mNow).startOf('year');
                mEnd = Moment(mNow).endOf('year');
                break;
        }
        var start = mStart.toDate();
        var end = mEnd.toDate();
        return {
            start: start,
            end: end
        };
    },

    onGranularityChange: function (granularity) {
        var params = Util.toDate(granularity);
        this.setState(extend({
            granularity: granularity
        }, params), function () {
            this.props.onDateRangeChange(params.start, params.end);
        });
    }
});
