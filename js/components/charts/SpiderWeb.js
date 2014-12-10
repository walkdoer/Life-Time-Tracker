/**
 * Spider Web
 */
'use strict';
var React = require('react');
var R = React.DOM;
var chart = require('./chart');
var Chart = require('chartjs');
var helper = require('./helper');
var _ = require('underscore');
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
        if (this.myRadarChart){
            this.myRadarChart.destroy();
            this.myRadarChart = this.chart.Radar(data, {});
        } else {
            this.chart = new Chart(ctx)
            this.myRadarChart = this.chart.Radar(data, {});
        }
    },

    compareData: function (datas, options) {
        this.setData(datas, options, true);
    }
});

module.exports = SpiderWeb;