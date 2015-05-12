/**
 * Bar Chart
 */
var React = require('react');
var chart = require('./chart');
var helper = require('./helper');
var convertor = require('../../convertors/column');
var compareConvertor = require('../../convertors/compareColumn');
var _ = require('lodash');
var extend = require('extend');
var CommonFunction = require('./CommonFunction');
var PureRenderMixin = require('react/addons').addons.PureRenderMixin;
var d3 = require('d3');

/**Utils */
var DataAPI = require('../../utils/DataAPI');

module.exports = React.createClass({
    displayName: 'D3SimpleColumn',

    mixins: [ CommonFunction, PureRenderMixin ],

    render: function() {
        var className = 'ltt_c-chart ltt_c-chart-D3SimpleColumn';
        if (this.props.className) {
            className  = [className, this.props.className].join(' ');
        }
        return(
            <div className={className}></div>
        );
    },

    componentDidMount: function () {
        this.plot(this.props.data);
    },


    componentWillUpdate: function (nextProps) {
        this.plot(nextProps.data);
    },

    plot: function (data) {
        if (_.isEmpty(data)) {return;}
        var $el = $(this.getDOMNode()).empty();
        var dataLen = data.length;
       //Width and height
        var w = $el.width();
        var h = $el.height();
        var barPadding = 1;
        var y = d3.scale.linear()
            .domain([0, d3.max(data)])
            .range([0, h]);
        //Create SVG element
        var svg = d3.select($el[0])
                    .append("svg")
                    .attr("width", w)
                    .attr("height", h);

        svg.selectAll("rect")
               .data(data)
               .enter()
               .append("rect")
               .attr("x", function(d, i) {
                    return i * (w / dataLen);
               })
               .attr("y", function(d) {
                    return h - y(d);
               })
               .attr("width", w / dataLen - barPadding)
               .attr("height", function(d) {
                    return y(d);
               })
               .attr("fill", '#f2f2f2');
    }

})