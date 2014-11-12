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
        var className = 'ltt_c-chart-pie';
        if (this.props.className) {
            className  = [className, this.props.className].join(' ');
        }
        return R.div({className: className});
    },

    setData: function (data) {
        this.props.data = data;
        if (data) {
            chart.pie({
                title: this.props.title,
                $el: $(this.getDOMNode()),
                data: pieConvertor.dispose(data)
            });
        }
    }
});

module.exports = Pie;