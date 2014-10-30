/**
 * 饼图
 */
define(function(require) {
    'use strict';
    var React = require('react');
    var R = React.DOM;
    var chart = require('./chart');
    var className = 'ltt_c-sleepPeriod';
    var LoadIndicator = require('app/components/loadIndicator');
    var classesConvertor = require('app/components/convertors/classes');
    var Pie = React.createClass({
        displayName: 'pie',
        componentDidMount: function () {
            var data = this.props.data;
            if (data) {
                chart.pie({
                    title: this.props.title,
                    $el: $(this.getDOMNode()),
                    data: classesConvertor.dispose(data)
                });
            }
        },
        render: function() {
            return R.div({className: className}, LoadIndicator());
        }
    });

    return Pie;
});