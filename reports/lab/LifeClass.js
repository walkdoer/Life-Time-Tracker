/**
 * @jsx React.DOM
 */

var React = require('react');
var Moment = require('moment');
var _ = require('lodash');
var PureRenderMixin = require('react/addons').addons.PureRenderMixin;
var ReactBootStrap = require('react-bootstrap');
var numeral = require('numeral');


var DataAPI = require('../../utils/DataAPI');
var Util = require('../../utils/Util');
var FullDateRangePicker = require('../../components/FullDateRangePicker');
var config = require('../../conf/config');


var LifeClass = React.createClass({

    getInitialState: function () {
        return {
            start: new Moment().startOf('month'),
            end: new Moment().endOf('month')
        };
    },

    render: function () {
        return <div className="lab-report ltt_c-report-LifeClass">
            <FullDateRangePicker start={this.state.start} end={this.state.end} onDateRangeChange={this.onDateRangeChange}  period='year' granularity='year'/>
            <svg></svg>
        </div>
    },

    onDateRangeChange: function (start, end) {
        this.setState({
            start: new Moment(start),
            end: new Moment(end)
        });
    },

    componentDidUpdate: function () {
        this.loadData().then(function (data) {
            this._data = data;
            this.plot(data, this.props);
        }.bind(this));
    },

    componentDidMount: function () {
        var that = this;
        this.initPlot();
        this.loadData().then(function (data) {
            that._data = data;
            that.plot(that._data, that.props);
        })
        this.onResizeToken = this.onResize.bind(this);
        $(window).on('resize', this.onResizeToken);
    },

     componentWillUnmount: function () {
        $(window).off('resize', this.onResizeToken);
    },

    onResize: function () {
        $(this.getDOMNode()).find('svg')[0].innerHTML = '';
        this.plot(this._data, this.props);
    },


    componentWillUnmount: function () {
        $(window).off('resize', this.onResizeToken);
    },

    loadData: function () {
        var start = this.state.start.toDate();
        var end = this.state.end.toDate();
        return DataAPI.Stat.loadv1({
            start: start,
            end: end,
            fields: "result.classTime date"
        }).then(function (data) {
            var classConfigs = config.classes;
            var arr = data.map(function (d) {
                var max, maxValue = 0;
                d.result.classTime.forEach(function (item) {
                    if (item.count > maxValue) {
                        max = item;
                    }
                });
                
                if (max) {
                    classConfigs.some(function (cls) {
                        if (cls._id === max.id) {
                            max.color = cls.color;
                            return true;
                        }
                        return false;
                    });
                    return {
                        date: new Moment(d.date).format(Util.DATE_FORMAT),
                        value: max
                    }
                } else {
                    return null;
                }
            }).filter(function (item) {
                return item !== null;
            });
            return Util.fillDataGapV2(arr, start, end, function (date) {
                return {
                    date: date,
                    value: {
                        count: 0,
                        color: '#FFF'
                    }
                };
            });
        });
    },

    initPlot: function () {
        this.chart = d3.select(this.getDOMNode()).select('svg');
    },

    plot: function (chartData, options) {
        if (!options) { options = this.props; }
        var chart = this.chart;
        var $el = $(this.getDOMNode());
        options = _.extend({
            itemPadding: 3,
            padding: 5,
            width: $el.width(),
            height: $el.height()
        }, options);
        var width = options.width;
        var height = options.height;
        chart.style('height', height);
        chart.style('width', width);

        var dayNum = this.state.end.diff(this.state.start, 'day');

        var columnNum, rowNum;
        if (this.props.column) {
            columnNum = this.props.column;
        }
        if (this.props.row) {
            rowNum = this.props.row;
        }
        if (!columnNum) {
            columnNum = 20;
        }
        if (!rowNum) {
            rowNum = Math.ceil(dayNum / columnNum);
        }
        var strokeWidth = 1;
        if (options.strokeWidth !== undefined) {
            strokeWidth = options.strokeWidth;
        }
        var stroke = options.stroke || 'black';
        var itemHoriPadding, itemVertPadding;
        itemHoriPadding = itemVertPadding= options.itemPadding;
        var padding = options.padding;

        var rectWidth = (width - padding * 2 - strokeWidth * 2- itemHoriPadding * (columnNum - 1)) / columnNum;
        var rectHeight = (height - padding * 2 - strokeWidth * 2 - itemVertPadding * (rowNum - 1)) / rowNum;

        var  days = chart.selectAll("g")
                .data(chartData, function (d) {
                    return d.date;
                });
        days.exit().remove();

        var groups = days.enter()
            .append('g');

        groups.append("rect")
            .attr("width", rectWidth)
            .attr("height", rectHeight)
            .attr("x", function (_, d) {
                var col = d % columnNum;
                return col * (itemHoriPadding + rectWidth) + padding;
            })
            .attr("y", function (_, d) {
                var row = Math.floor(d / columnNum);
                return row * (itemVertPadding + rectHeight) + padding;
            })
            .style('stroke-width', strokeWidth)
            .style('stroke', stroke)
            .style("fill", function(d) {
                return d.value.color;
            });
        groups.append("title")
            .text(function(d) { return d.date; });
    }


});



module.exports = LifeClass;