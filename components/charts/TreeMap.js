/**
 * Month CountDown
 */

'use strict';
var React = require('react');
var R = React.DOM;
var Moment = require('moment');
var _ = require('lodash');

module.exports = React.createClass({
    displayName: 'TreeMap',
    getDefaultProps: function() {
        return {
            width: 960,
            height: 500,
            root: []
        };
    },

    render: function() {
        return <div className="ltt_c-chart ltt_c-chart-TreeMap">
            <div className="ltt_c-chart-title">{this.props.title}</div>
            <div className="ltt_c-chart-TreeMap-content"></div>
        </div>;
    },

    componentDidMount: function() {
        this.plot();
    },

    plot: function(root) {
        if (!root) {
            root = this.props.root;
        }
        var margin = {
            top: 40,
            right: 10,
            bottom: 10,
            left: 10
        };
        var width = this.props.width - margin.left - margin.right;
        var height = this.props.height - margin.top - margin.bottom;

        var color = d3.scale.category20c();

        var treemap = d3.layout.treemap()
            .size([width, height])
            .sticky(true)
            .value(function(d) {
                return d.size;
            });

        var div = d3.select(this.getDOMNode()).select('.ltt_c-chart-TreeMap-content')
            .style("position", "relative")
            .style("width", (width + margin.left + margin.right) + "px")
            .style("height", (height + margin.top + margin.bottom) + "px")
            .style("left", margin.left + "px")
            .style("top", margin.top + "px");

        var node = div.datum(root).selectAll(".node")
            .data(treemap.nodes)
            .enter().append("div")
            .attr("class", "ltt_c-chart-TreeMap-node")
            .call(position)
            .style("background", function(d) {
                return d.children ? color(d.name) : null;
            })
            .text(function(d) {
                return d.children ? null : d.name;
            });
        /*
        d3.selectAll("input").on("change", function change() {
            var value = this.value === "count" ? function() {
                return 1;
            } : function(d) {
                return d.size;
            };

            node
                .data(treemap.value(value).nodes)
                .transition()
                .duration(1500)
                .call(position);
        });*/

        function position() {
            this.style("left", function(d) {
                return d.x + "px";
            })
            .style("top", function(d) {
                return d.y + "px";
            })
            .style("width", function(d) {
                return Math.max(0, d.dx - 1) + "px";
            })
            .style("height", function(d) {
                return Math.max(0, d.dy - 1) + "px";
            });
        }
    }
});