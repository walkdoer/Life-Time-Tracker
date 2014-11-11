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
        var className = 'ltt_c-dateRangePicker input-daterange input-group ' + this.props.className;
        return (
            <div ref="dateRange" className={className}>
                <input ref="startDate" type="text" className="input-sm form-control" name="start" />
                <span className="input-group-addon">to</span>
                <input ref="endDate" type="text" className="input-sm form-control" name="end" />
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
    }

});

module.exports = DateRangePicker;
