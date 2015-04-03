'use strict';
var React = require('react');
var _ = require('lodash');
var Moment = require('moment');

var Chart = require('./chart');

module.exports = React.createClass({

    getDefaultProps: function () {
        return {
            logs: []
        };
    },

    render: function() {
        return (
            <div className="ltt_c-chart ltt_c-chart-LogLine"></div>
        );
    },

    componentDidUpdate: function () {
        this._plot();
    },

    componentDidMount: function () {
        this._plot();
    },

    _plot: function () {
        var $el = $(this.getDOMNode());
        var lineData = [{
            name:'',
            data: this._getLineData()
        }];
        console.log(lineData);
        Chart.line({
            title: this.props.title,
            $el: $el,
            data: lineData
        }, {
            chart: {
                type: 'areaspline'
            },
            plotOptions: {
                areaspline: {
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
                    fillOpacity: 0.5
                },
                series: {
                    showInLegend: false
                }
            },
            yAxis: {
                title: false
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
    },


    _getLineData: function () {
        var logs = this.props.logs;
        return logs.slice(0).sort(function (a, b) {
            return new Date(a.start).getTime() - new Date(b.start).getTime();
        }).map(function (log) {
            return [new Moment(log.start).unix() * 1000, log.len];
        });
    }
});