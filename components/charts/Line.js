/**
 * 饼图
 */
'use strict';
var React = require('react');
var R = React.DOM;
var Chart = require('./chart');
var _ = require('lodash');
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
        var visibleCount = this.props.visibleCount;
        if (_.isNumber(visibleCount)) {
            data.forEach(function (serie, index) {
                serie.visible = index < visibleCount;
            });
        }
        if (data) {
            var $el = $(this.getDOMNode());
            Chart.line({
                title: this.props.title,
                $el: $el,
                data: data
            }, {
                chart: {
                    type: this.props.type
                },
                plotOptions: {
                    area: {
                        marker: {
                            enabled: false,
                            symbol: 'circle',
                            radius: 2,
                            states: {
                                hover: {
                                    enabled: true
                                }
                            }
                        },
                        fillOpacity: 0.1
                    },
                    areaspline: {
                        fillOpacity: 0.1
                    }
                },
                tooltip: {
                    crosshairs: true,
                    shared: true
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
            var chart = $el.highcharts();
            this.selectActiveSeries(chart.series);
        }
    },

    selectActiveSeries: function (series) {
        series.sort(function (a, b) {
            var aSum = a.data.reduce(function (sum, val) { return sum + val.y; }, 0);
            var bSum = b.data.reduce(function (sum, val) { return sum + val.y; }, 0);
            return bSum - aSum;
        }).forEach(function (serie, index) {
            if (index < 4) {
                serie.show();
            } else {
                serie.hide();
            }
        });
    }
});

module.exports = Line;