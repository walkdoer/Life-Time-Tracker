/**
 * @jsx React.DOM
 */

var React = require('react');
var Moment = require('moment');


var DatePicker = React.createClass({

    getDefaultProps: function () {
        return {
            date: new Moment(),
            onChange: function () {}
        };
    },

    componentDidMount: function () {
        var onChange = this.props.onChange;
        var date = this.props.date;
        var $datePicker = $(this.refs.date.getDOMNode());
        $datePicker.datepicker({
            todayHighlight: true,
            format: this.props.format || 'yyyy-mm-dd'
        }).datepicker('setDate', date.format('YYYY-MM-DD'));
        $datePicker.on('changeDate', function (e) {
            var date = e.date;
            onChange(Moment(date));
        });
    },


    render: function () {
        var className = 'ltt_c-datePicker ' + (this.props.className || '');
        return (
             <div className={className}>
                <button className="prev" type="button" onClick={this.prevDate} title="prev">
                    <i className="fa fa-angle-double-left"></i>
                </button>
                <input type="text" ref="date" className="input-date"/>
                <button className="next" type="button" onClick={this.nextDate} title="next">
                    <i className="fa fa-angle-double-right"></i>
                </button>
            </div>
        );
    },

    prevDate: function () {
        var date = this.props.date;
        date = Moment(date).subtract(1, 'day');
        var $datePicker = $(this.refs.date.getDOMNode());
        $datePicker.datepicker('setDate', date.format('YYYY-MM-DD'));
        this.props.onChange(date);
    },


    nextDate: function () {
        var date = this.props.date;
        date = Moment(date).add(1, 'day');
        var $datePicker = $(this.refs.date.getDOMNode());
        $datePicker.datepicker('setDate', date.format('YYYY-MM-DD'));
        this.props.onChange(date);
    }

});

module.exports = DatePicker;
