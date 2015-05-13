/**
 * 饼图
 */
'use strict';
var React = require('react');
var R = React.DOM;
var chart = require('./chart');
var PureRenderMixin = require('react/addons').addons.PureRenderMixin;
var pieConvertor = require('../../convertors/pie');

var Pie = React.createClass({
    displayName: 'pie',
    mixins: [PureRenderMixin],
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
        this.updateData(nextProps.data);
    },

    setData: function (data) {
        this.props.data = data;
        if (data) {
            this.chart = chart.pie({
                title: this.props.title,
                $el: $(this.getDOMNode()),
                data: pieConvertor.dispose(data)
            }, this.props.highchartOptions);
        }
    },

    updateData: function (data) {
        var index = this.chart.data('highchartsChart');
        var chart = Highcharts.charts[index];
        data = pieConvertor.dispose(data);
        chart.series[0].setData(data.data);
    }
});

module.exports = Pie;