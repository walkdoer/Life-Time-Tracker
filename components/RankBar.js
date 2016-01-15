/**
 * @jsx React.DOM
 */

var React = require('react');
var Moment = require('moment');
var _ = require('lodash');
var PureRenderMixin = require('react/addons').addons.PureRenderMixin;
var RB = require('react-bootstrap');
var numeral = require('numeral');
var Q = require('q');

var config = require('../conf/config');

/** components */
var LoadingMask = require('./LoadingMask');
var Bar = require('./charts/Bar');

/** Utils */
var DataAPI = require('../utils/DataAPI');

/** constants */

module.exports = React.createClass({

    getInitialState: function () {
        return {
            loaded: false,
            rankingData: []
        };
    },

    getDefaultProps: function () {
        return {
            start: new Moment().startOf('day'),
            end: new Moment().endOf('day'),
            tabs: ['tags', 'classes', 'project', 'version', 'task']
        };
    },

    render: function () {
        var data = this.state.rankingData;
        var highchartOptions = {};
        if (this.props.backgroundColor) {
            highchartOptions.chart = {
                backgroundColor: this.props.backgroundColor
            };
        }
        return (
            <div className={"ltt_c-RankBar " + (this.props.className || "")}>
                <Bar data={this.props.type === 'classes' ? this.convertClassesData(data) : this.convertData(data)}
                    exporting={false}
                    highchartOptions={highchartOptions}
                    labelWidth={this._width * 0.3}
                    legend={false}/>
                <LoadingMask loaded={this.state.loaded}/>
            </div>
        );
    },
    componentDidMount: function () {
        this.loadRankingData();
        this._width = $(this.getDOMNode()).width();
    },

    componentWillReceiveProps: function (nextProps) {
        this.loadRankingData(nextProps.params);
    },

    loadRankingData: function (params) {
        var that = this;
        var requestParmas = extend({
            sum: true,
            group: this.props.type
        }, this.props.params);
        if (params) {
            requestParmas = extend({}, requestParmas, params);
        }
        DataAPI.Log.load(requestParmas).then(function (list) {
            return list.filter(function (item) {
                return item._id !== null;
            }).sort(function (a, b){
                return b.totalTime - a.totalTime;
            });
        }).then(function (data) {
            that.setState({
                loaded: true,
                rankingData: data
            });
        });
    },

    convertData: function (data) {
        return data.map(function (item) {
            var name;
            if (item._id && item._id.name) {
                name = item._id.name;
            } else {
                name = item._id || 'unknow';
            }
            return {
                label: name,
                value: item.totalTime
            };
        });
    },

    convertClassesData: function (data) {
        var logClasses = config.classes;
        return data.map(function (item) {
            var name;
            var itemId = item._id;
            if (itemId && itemId.name) {
                name = itemId.name;
            } else if (itemId){
                var clsConfig = logClasses.filter(function (cls) {
                    return cls._id === itemId;
                })[0];
                name = clsConfig ? clsConfig.name : "unknow";
            }
            return {
                label: name,
                value: item.totalTime
            };
        });
    }
});