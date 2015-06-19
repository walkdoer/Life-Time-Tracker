/**
 * Spider Web
 */
'use strict';
var React = require('react');
var R = React.DOM;
var chart = require('./chart');
var Chart = require('chart.js');
var helper = require('./helper');
var _ = require('lodash');
var CommonFunction = require('./CommonFunction');
var extend = require('extend');
//convertors
var spiderWebConvertor = require('../../convertors/spiderWeb');
var SpiderWeb = React.createClass({
    displayName: 'spiderWeb',
    mixins: [ CommonFunction ],
    render: function() {
        var className = 'ltt_c-chart ltt_c-chart-spiderWeb';
        if (this.props.className) {
            className  = [className, this.props.className].join(' ');
        }
        return (
            <div className={className}>
                <canvas ref="canvas" height="288"></canvas>
            </div>
        )
    },

    setData: function(data, options, isGroup) {
        var data = spiderWebConvertor.dispose(data, this.props.categories, isGroup);
        //data.datasets[0].la
        var ctx = this.refs.canvas.getDOMNode().getContext("2d");
        var plotOptions = {
            pointDot: false,
            scaleShowLabels : false
        };
        if (this.myRadarChart){
            this.myRadarChart.destroy();
            this.myRadarChart = new Chart(ctx).Radar(data, plotOptions);
        } else {
            this.myRadarChart = new Chart(ctx).Radar(data, plotOptions);
        }
    },

    compareData: function (datas, options) {
        this.setData(datas, options, true);
    }
});

module.exports = SpiderWeb;