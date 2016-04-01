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

    getDefaultProps: function () {
        return {
            height: 700
        };
    },

    render: function () {
        return <div className="lab-report ltt_c-report-Sunburst">
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
        return DataAPI.Log.classify().then(function (data) {
            data = data.map(function (project) {
                var projectInfo = project._id;
                var versions = project.versions || [];
                var versionData = versions.map(function (version) {
                    var versionInfo = version._id;
                    var taskData = (version.tasks || []).map(function (task) {
                        var taskInfo = task._id;
                        return {
                            name: taskInfo.name || taskInfo._id,
                            size: task.totalTime,
                            children: (task.children || []).map(function (task) {
                                var taskInfo = task._id;
                                return {
                                    name: taskInfo.name || taskInfo._id,
                                    size: task.totalTime
                                };
                            })
                        };
                    });
                    return {
                        name: versionInfo.name,
                        size: version.totalTime,
                        children: taskData
                    };
                });
                return {
                    name: projectInfo.name,
                    size: project.totalTime,
                    children: versionData
                }
            });
            return {
                name: 'Life',
                children: data
            };
        });
    },

    plot: function (root, options) {
        if (!options) { options = this.props; }
        var el = this.getDOMNode();
        var $el = $(el);
        var width = this.props.width || $el.width(),
            height = this.props.height,
            radius = (Math.min(width, height) / 2) - 10;

        var formatNumber = d3.format(",d");

        var x = d3.scale.linear()
            .range([0, 2 * Math.PI]);

        var y = d3.scale.sqrt()
            .range([0, radius]);

        var color = d3.scale.category20c();

        var partition = d3.layout.partition()
            .value(function(d) { return d.size; });

        var arc = d3.svg.arc()
            .startAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x))); })
            .endAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x + d.dx))); })
            .innerRadius(function(d) { return Math.max(0, y(d.y)); })
            .outerRadius(function(d) { return Math.max(0, y(d.y + d.dy)); });

        var chart = d3.select(el);
        chart.select('svg').remove();
        var svg = chart.append("svg")
            .attr("width", width)
            .attr("height", height)
          .append("g")
            .attr("transform", "translate(" + width / 2 + "," + (height / 2) + ")");


          svg.selectAll("path")
              .data(partition.nodes(root))
            .enter().append("path")
              .attr("d", arc)
              .style("fill", function(d) { return color((d.children ? d : d.parent).name); })
              .on("click", click)
            .append("title")
              .text(function(d) { return d.name + "\n" + formatNumber(d.value); });

        function click(d) {
          svg.transition()
              .duration(750)
              .tween("scale", function() {
                var xd = d3.interpolate(x.domain(), [d.x, d.x + d.dx]),
                    yd = d3.interpolate(y.domain(), [d.y, 1]),
                    yr = d3.interpolate(y.range(), [d.y ? 20 : 0, radius]);
                return function(t) { x.domain(xd(t)); y.domain(yd(t)).range(yr(t)); };
              })
            .selectAll("path")
              .attrTween("d", function(d) { return function() { return arc(d); }; });
        }
    }


});



module.exports = LifeClass;