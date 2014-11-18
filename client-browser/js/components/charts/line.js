/**
 * 饼图
 */
'use strict';
var React = require('react');
var R = React.DOM;
var chart = require('./chart');
//var lineConvertor = require('../../convertors/line');
var Line = React.createClass({
    displayName: 'line',
    getDefaultProps: function () {
        return {
            type: 'line'
        };
    },

    render: function() {
        var className = 'ltt_c-chart ltt_c-chart-line';
        if (this.props.className) {
            className  = [className, this.props.className].join(' ');
        }
        return R.div({className: className});
    },

    setData: function (data) {
        this.props.data = data;
        if (data) {
            chart.line({
                title: this.props.title,
                $el: $(this.getDOMNode()),
                data: data
            }, {
                chart: {
                    type: this.props.type
                },
                plotOptions: {
                    series: {
                        marker: {
                            enabled: false
                        }
                    }
                },
                xAxis: {
                    type: 'datetime',
                    dateTimeLabelFormats: { // don't display the dummy year
                        millisecond: '%H:%M:%S.%L',
                        second: '%H:%M:%S',
                        minute: '%H:%M',
                        hour: '%H:%M',
                        day: '%m-%e',
                        week: '%e. %b',
                        month: '%b \'%y',
                        year: '%Y'
                    }
                }
            });
        }
    }
});

module.exports = Line;