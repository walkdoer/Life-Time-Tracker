/**
 * Month CountDown
 */

'use strict';
var React = require('react');
var R = React.DOM;
var Moment = require('moment');
var _ = require('lodash');

module.exports = React.createClass({
    displayName: 'D3TreeMap',
    getDefaultProps: function() {
        return {
            root: []
        };
    },

    render: function() {
        return <div className="ltt_c-chart ltt_c-chart-D3TreeMap">
            <div className="ltt_c-chart-D3title">{this.props.title}</div>
            <div className="ltt_c-chart-D3TreeMap-content" ref="content"></div>
        </div>;
    },

    componentDidMount: function() {
        this.plot();
    },


    componentDidUpdate: function () {
        this.plot();
    },

    plot: function(root) {
        //return;
        if (!root) {
            root = this.props.root;
        }
        if (!root) {return;}
        var margin = {
            top: 0,
            right: 0,
            bottom: 0,
            left: 0
        };
        var $node = $(this.refs.content.getDOMNode())
        var width = $node.width();
        var height = 300;
        width = width - margin.left - margin.right;
        height = height - margin.top - margin.bottom;

        var color = d3.scale.category20c();

        var treemap = d3.layout.treemap()
            .size([width, height])
            .sticky(true)
            .value(function(d) {
                return d.size;
            });

        var div = d3.select(this.getDOMNode()).select('.ltt_c-chart-D3TreeMap-content')
            .style("position", "relative")
            .style("width", (width + margin.left + margin.right) + "px")
            .style("height", (height + margin.top + margin.bottom) + "px");

        var node = div.datum(root).selectAll(".node")
            .data(treemap.nodes)
            .enter().append("div")
            .attr("class", "node")
            .call(position)
            .style("background", function(d) {
                return color(d.name);
            })
            .text(function(d) {
                return d.name;
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