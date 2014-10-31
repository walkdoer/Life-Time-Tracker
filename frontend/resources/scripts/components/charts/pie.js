/**
 * 饼图
 */
define(function(require) {
    'use strict';
    var React = require('react');
    var R = React.DOM;
    var chart = require('./chart');
    var LoadIndicator = require('app/components/loadIndicator');
    var pieConvertor = require('app/components/convertors/pie');
    var Pie = React.createClass({
        displayName: 'pie',
        render: function() {
            var className = 'ltt_c-chart-pie';
            if (this.props.className) {
                className  = [className, this.props.className].join(' ');
            }
            return R.div({className: className}, LoadIndicator());
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

    return Pie;
});