'use strict';

var React = require('react');
var d3 = require('d3');
var $ = require('jquery');
var cloud = require('../../libs/d3.layout.cloud');

module.exports = React.createClass({

    render: function() {
        return <div className="ltt_c-chart ltt_c-chart-wordsCloud"></div>;
    },

    shouldComponentUpdate: function (nextProps) {
        return this.props.words !== nextProps.words;
    },

    componentDidUpdate: function () {
        this.plot(this.props.words);
    },

    componentDidMount: function () {
        this.plot(this.props.words);
    },

    plot: function (words) {
        var $el = $(this.getDOMNode());
        this.width = this.props.width || $el.width();
        this.height = this.props.height || this.width * 0.5;
        words.sort(function (a, b) {
            return a.size - b.size;
        });
        var fontSize = d3.scale.linear().range([10, 100]);
        if (words.length) {
            fontSize.domain([+words[0].size, +words[words.length-1].size]);
        }
        cloud().size([this.width, this.height])
            .words(words)
            .padding(5)
            .rotate(function() {
                return ~~(Math.random() * 2) * 90;
            })
            .font("Impact")
            .fontSize(function(d) {
                return fontSize(d.size);
            })
            .on("end", this.draw.bind(this))
            .start();
    },


    draw: function draw(words) {
        var fill = d3.scale.category20();
        d3.select(this.getDOMNode()).select('svg').remove();
        d3.select(this.getDOMNode()).append("svg")
            .attr("width", this.width)
            .attr("height", this.height)
            .append("g")
            .attr("transform", "translate(" + (this.width >> 1) + "," + (this.height >> 1) + ")")
            .selectAll("text")
            .data(words)
            .enter().append("text")
            .style("font-size", function(d) {
                return d.size + "px";
            })
            .style("font-family", "Impact")
            .style("fill", function(d, i) {
                return fill(i);
            })
            .attr("text-anchor", "middle")
            .attr("transform", function(d) {
                return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
            })
            .text(function(d) {
                return d.text;
            });
    }
})