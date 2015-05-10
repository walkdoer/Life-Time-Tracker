'use strict';

var React = require('react');
var $ = require('jquery');



module.exports = React.createClass({

    render: function() {
        var height = this.props.height;
        var style = {};
        if (height) {
            style.height = height;
        }
        return <div className="ltt_c-chart ltt_c-chart-PercentArea" style={style}></div>;
    },

    componentDidMount: function () {
        this.plot();
    },

    componentDidUpdate: function () {
        this.plot();
    },

    plot: function () {
        $(this.getDOMNode()).highcharts({
            chart: {
                type: 'area'
            },
            title: {
                text: 'Classes trend'
            },
            subtitle: {
                text: 'test'
            },
            xAxis: {
                type: 'datetime',
                minTickInterval: 3600 * 24 * 1000,
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
            },
            yAxis: {
                title: {
                    text: 'Percent'
                }
            },
            tooltip: {
                pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.percentage:.1f}%</b> ({point.y:,.0f} millions)<br/>',
                shared: true
            },
            plotOptions: {
                area: {
                    stacking: 'percent',
                    lineColor: '#ffffff',
                    lineWidth: 1,
                    marker: {
                        enabled: false,
                        lineWidth: 1,
                        lineColor: '#ffffff',
                        states: {
                            hover: {
                                enabled: true
                            }
                        }
                    }
                }
            },
            series: this.props.data
        });
    }
});