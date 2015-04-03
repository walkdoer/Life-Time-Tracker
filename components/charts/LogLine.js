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
            name: this.props.name,
            data: this._getLineData()
        }];
        var title = this._getTitle();
        Chart.line({
            $el: $el,
            data: lineData
        }, {
            title: {
                text: title,
                style: {
                    'font-size': '12px',
                    'font-weight': 'bold'
                }
            },
            chart: {
                type: 'areaspline'
            },
            tooltip: {
                pointFormat: '{series.name}: <b>{point.y}</b><br/>',
                valueSuffix: ' minutes',
                shared: true,
                dateTimeLabelFormats: { // don't display the dummy year
                    millisecond: '%Y-%m-%d %H:%M:%S.%L',
                    second: '%Y-%m-%d %H:%M:%S',
                    minute: '%Y-%m-%d %H:%M',
                    hour: '%Y-%m-%d %H:%M',
                    day: '%Y-%m-%d %H:%M',
                    week: '%Y-%m-%d %H:%M',
                    month: '%Y-%m-%d %H:%M',
                    year: '%Y-%m-%d %H:%M'
                }
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
                /*labels: {
                    format: '{value:%Y-%m-%d}',
                    rotation: 90,
                    align: 'left'
                },*/
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
    },

    _getTitle: function () {
        var logs = this.props.logs;
        if (_.isEmpty(logs)) {
            return '';
        }
        var data = logs.slice(0).sort(function (a, b) {
            return new Date(a.start).getTime() - new Date(b.start).getTime();
        });

        var minDate = data[0].date;
        var maxDate = data[data.length - 1].date;
        var days = new Moment(maxDate).diff(minDate, 'day');

        return 'Total ' + data.length + ' logs' + (days > 0 ? ' Cross ' + days + ' days' : '');
    }
});