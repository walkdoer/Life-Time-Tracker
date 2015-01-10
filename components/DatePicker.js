/**
 * @jsx React.DOM
 */

var React = require('react');
var Moment = require('moment');

var DatePicker = React.createClass({
    componentDidMount: function () {
        var onChange = this.props.onChange;
        var today = new Moment().format('YYYY-MM-DD');
        $(this.refs.date.getDOMNode()).datepicker({
            todayHighlight: true,
            format: this.props.format || 'yyyy-mm-dd'
        }).on('changeDate', function (e) {
            var date = e.date;
            onChange(date);
        }).datepicker('setDate', today);
    },
    render: function () {
        var className = 'ltt_c-datePicker ' + this.props.className;
        return (
            <input type="text" ref="date" className={className}/>
        );
    }

});

module.exports = DatePicker;
