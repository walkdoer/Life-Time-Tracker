/**
 * 饼图
 */
'use strict';
var React = require('react');
var R = React.DOM;
var chart = require('./chart');
var pieConvertor = require('../../convertors/pie');
var Pie = React.createClass({
    displayName: 'pie',
    render: function() {
        var className = 'ltt_c-chart ltt_c-chart-pie';
        if (this.props.className) {
            className  = [className, this.props.className].join(' ');
        }
        return R.div({className: className});
    },

    componentDidMount: function () {
        this.setData(this.props.data);
    },

    componentWillUpdate: function (nextProps) {
        this.setData(nextProps.data);
    },

    setData: function (data) {
        this.props.data = data;
        if (data) {
            chart.pie({
                title: this.props.title,
                $el: $(this.getDOMNode()),
                data: pieConvertor.dispose(data)
            }, this.props.highchartOptions);
        }
    }
});

module.exports = Pie;