'use strict';
var React = require('react');
var _ = require('lodash');
var Moment = require('moment');

var Chart = require('./chart');

module.exports = React.createClass({

    getDefaultProps: function () {
        return {
            backgroundColor: 'rgba(0,0,0,0)',
            xAxisLabel: true,
            highlightToday: false,
            highlightColor: 'red',
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
        var date = this.props.date;
        var $el = $(this.getDOMNode());
        var data = this._getData();
        var average = this._getAverage();
        var title = this._getTitle();
        var tickInterval;
        var mStart, mEnd;
        var granularity = this.props.granularity;
        if (granularity) {
            switch(granularity) {
                case 'month':
                case 'monthly':
                    tickInterval = 3600 * 24 * 100;
                    break;
                case 'day':
                    tickInterval = 3600 * 1000;
                    break;
                case 'week':
                case 'weekly':
                    tickInterval = 3600 * 24 * 100;
                    break;
                default:
                    break;
            }
            mStart = new Moment(date).startOf(granularity);
            mEnd = new Moment(date).endOf(granularity);
        }
        var yAxis;
        if (this.props.withProgress) {
            yAxis = [{
                title: false
            }, {
                title: false,
                opposite: true,
                min: 0,
                max: 100,
                labels: {
                    format: '{value} %',
                }
            }];
        } else {
            yAxis = {
                title: false
            };
        }

        if (average !== null) {
            var plotLines = [{
                color: 'red',
                value: average,
                dashStyle: 'longdashdot',
                width: '1'
            }];
            if (this.props.withProgress) {
                yAxis[0].plotLines = plotLines;
            } else {
                yAxis.plotLines = plotLines;
            }
        }
        var options = {
            exporting: { enabled: false },
            chart: {
                backgroundColor: this.props.backgroundColor
            },
            title: {
                text: title,
                style: {
                    'font-size': '12px',
                    'font-weight': 'bold'
                }
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
                    day: '%Y-%m-%d',
                    week: '%Y-%m-%d',
                    month: '%Y-%m',
                    year: '%Y'
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
                    showInLegend: false,
                    //pointWidth: 10,
                    pointInterval: tickInterval
                }
            },
            yAxis: yAxis,
            xAxis: {
                type: 'datetime',
                minTickInterval: tickInterval,
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
        };
        if (this.props.xAxisLabel === false) {
            options.xAxis.labels = _.extend({}, options.xAxis.labels, {enabled: false});
            options.xAxis.tickWidth = 0;
        }
        if (this.props.yAxisLabel === false) {
            options.yAxis.gridLineWidth = 0;
        }
        if (granularity) {
            options.xAxis.min = mStart.unix() * 1000;
            options.xAxis.max = mEnd.unix() * 1000;
        }
        var chartType;
        if (this.props.type === 'progress') {
            chartType = 'line';
        } else {
            chartType = 'column';
        }
        Chart[chartType]({
            $el: $el,
            data: data
        }, options);
    },


    _getData: function () {
        var series = [{
            name: 'time consume',
            data: this.getTimeData()
        }];
        if (this.props.withProgress) {
            series.push({
                type: 'spline',
                name: 'progress',
                yAxis: 1,
                data: this.getProgressData()
            });
        }
        return series;
    },

    getProgressData: function () {
        var isSubTask = this.props.isSubTask;
        var progressField;
        if (isSubTask) {
            progressField = 'subTask';
        } else {
            progressField = 'task';
        }
        var logs = this.props.logs;
        return logs.slice(0).sort(function (a, b) {
            return new Date(a.start).getTime() - new Date(b.start).getTime();
        }).map(function (log) {
            return [new Moment(log.start).unix() * 1000, log.progress[progressField]];
        });
    },

    _getAverage: function () {
        var data = this.getTimeData();
        if (this.props.granularity) {
            var diff = Math.abs(new Moment(this.props.date).startOf(this.props.granularity).diff(this.props.date, 'day')) + 1;
        } else {
            return null;
        }
        if (_.isEmpty(data)) {
            return 0;
        }
        return _.sum(data, function (item) { return item.y}) / diff;
    },

    getTimeData: function () {
        var logs = this.props.logs;
        var groupedData;
        if (this.props.grouped) {
            groupedData = logs;
            groupedData = groupedData.map(function (item) {
                var unix = new Moment(item.date).startOf('day').unix() * 1000;
                var data = {x: unix, y: item.count};
                return data;
            }).sort(function (a, b) {
                return a.x - b.x;
            });
        } else {
            groupedData = this.groupData(logs);
        }
        var todayUnix = new Moment(this.props.date).unix() * 1000;
        var highlightToday = this.props.highlightToday;
        var highlightColor = this.props.highlightColor;
        groupedData.forEach(function (d) {
            if (highlightToday && todayUnix === d.x) {
                d.color = highlightColor;
            }
            return d;
        });
        return groupedData;
    },

    groupData: function (logs) {
        var todayUnix = new Moment(this.props.date).unix() * 1000;
        var granularity = this.props.granularity;
        if (['weekly', 'week', 'month', 'monthly', 'year', 'annual'].indexOf(granularity) >= 0) {
            var data = logs.reduce(function (result, log) {
                var date = new Moment(log.date).startOf('day').unix() * 1000;
                if (result[date] !== undefined) {
                    result[date] += log.len;
                } else {
                    result[date] = log.len;
                }
                return result;
            }, {});
            data = _.pairs(data).map(function (d) {
                var unix = parseInt(d[0], 10);
                var data = {x: unix, y: d[1]};
                return data;
            }).sort(function (a, b) {
                return a.x - b.x;
            });
            return data || [];
        } else {
            return logs.slice(0).sort(function (a, b) {
                return new Date(a.start).getTime() - new Date(b.start).getTime();
            }).map(function (log) {
                var unix = new Moment(log.date).unix() * 1000;
                var data = {x: new Moment(log.start).unix() * 1000, y: log.len};
                return data;
            });
        }
    },

    _getTitle: function () {
        if (this.props.title === false) {
            return false;
        }
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