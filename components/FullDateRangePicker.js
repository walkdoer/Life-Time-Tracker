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

module.exports = React.createClass({
    getInitialState: function () {
        return {
            period: this.props.period,
            granularity: this.props.granularity
        };
    },

    getDefaultProps: function () {
        return {
            showCompare: true,
            period: 'today'
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
                        start={this.props.start}
                        bsSize={this.props.bsSize}
                        end={this.props.end}
                        granularity={this.state.granularity}
                        onDateRangeChange={this.props.onDateRangeChange}/>
                    {this.props.showCompare ? <input ref="isCompared" type="checkbox" onChange={this.onCompare}/> : null }
                    {compareComponents}
                </div>
                <ButtonToolbar>
                    <ButtonGroup>
                        {[
                            {label: 'Yesterday', value: 'yesterday'},
                            {label: 'Today', value: 'today'},
                            {label: 'Week', value: 'week'},
                            {label: 'Month', value: 'month'}
                        ].map(function (btn) {
                            return <Button active={period === btn.value} bsSize={this.props.bsSize}
                                onClick={this.onPeriodChange.bind(this, btn.value)}>{btn.label}</Button>;
                        }, this)}
                    </ButtonGroup>
                    <ButtonGroup>
                        {[
                            {label: 'day', value: 'day'},
                            {label: 'Week', value: 'week'},
                            {label: 'Month', value: 'month'},
                            {label: 'Year', value: 'year'}
                        ].map(function (btn) {
                            return <Button active={btn.value === granularity} bsSize={this.props.bsSize}
                                onClick={this.onGranularityChange.bind(this, btn.value)}>{btn.label}</Button>;
                        }, this)}
                    </ButtonGroup>
                </ButtonToolbar>
            </div>
        );
    },

    onCompare: function (e) {
        var checked = e.target.checked;
        this.props.onCompare(checked);
    },

    onPeriodChange: function (period) {
        this.setState({
            period: period
        });
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
        if (mStart && mEnd) {
            this.props.onDateRangeChange(mStart.toDate(), mEnd.toDate());
        }
    },

    onGranularityChange: function (granularity) {
        this.setState({
            granularity: granularity
        });
    }
});
