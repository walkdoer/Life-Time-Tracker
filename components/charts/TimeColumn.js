'use strict';
var React = require('react');
var _ = require('lodash');
var Moment = require('moment');

var Chart = require('./chart');

module.exports = React.createClass({

    getDefaultProps: function () {
        return {
            xAxisLabel: true,
            logs: []
        };
    },

    render: function() {
        return (
            <div className="ltt_c-chart ltt_c-chart-timeColumn"></div>
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
        var data = [{
            name: this.props.name,
            data: this.props.data
        }];
        var title = this._getTitle();
        var options = {
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
                    day: '%Y-%m-%d %H:%M',
                    week: '%Y-%m-%d %H:%M',
                    month: '%Y-%m-%d %H:%M',
                    year: '%Y-%m-%d %H:%M'
                }
            },
            plotOptions: {
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
        };
        if (this.props.xAxisLabel === false) {
            options.xAxis.labels = _.extend({}, options.xAxis.labels, {enabled: false});
            options.xAxis.tickWidth = 0;
        }
        if (this.props.yAxisLabel === false) {
            options.yAxis.gridLineWidth = 0;
        }
        Chart.column({
            $el: $el,
            data: data
        }, options);
    },


    _getTitle: function () {
        return false;
    }
});