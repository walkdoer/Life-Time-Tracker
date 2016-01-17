/**
 * @jsx React.DOM
 */

var React = require('react');
var Moment = require('moment');
var _ = require('lodash');
var PureRenderMixin = require('react/addons').addons.PureRenderMixin;
var ReactBootStrap = require('react-bootstrap');
var numeral = require('numeral');


var DataAPI = require('../../utils/DataAPI');
var Util = require('../../utils/Util');
var FullDateRangePicker = require('../../components/FullDateRangePicker');
var LogClassPie = require('../../components/LogClassPie');


var PieReport = React.createClass({

    getInitialState: function () {
        return {
            start: new Moment().startOf('month'),
            end: new Moment().endOf('month')
        };
    },

    render: function () {
        var s = Moment(this.state.start);
        var end = this.state.end;
        var pies = [], date;
        while (end.diff(s, 'day') > 0) {
            date = s.format(Util.DATE_FORMAT);
            pies.push(<LogClassPie  type="classes" backgroundColor="rgba(255, 255, 255, 0.1)" title={date} date={date} compare={false}/>);
            s.add(1, 'day');
        }
        return <div className="lab-report pie">
            <FullDateRangePicker start={this.state.start} end={this.state.end} onDateRangeChange={this.onDateRangeChange}/>
            {pies}
        </div>
    },

    onDateRangeChange: function (start, end) {
        this.setState({
            start: new Moment(start),
            end: new Moment(end)
        });
    }

});



module.exports = PieReport;