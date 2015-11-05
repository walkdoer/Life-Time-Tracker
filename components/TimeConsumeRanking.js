/**
 * @jsx React.DOM
 */

var React = require('react');
var Moment = require('moment');
var _ = require('lodash');
var PureRenderMixin = require('react/addons').addons.PureRenderMixin;
var RB = require('react-bootstrap');
var Table = RB.Table;
var TabbedArea = RB.TabbedArea;
var TabPane = RB.TabPane;
var numeral = require('numeral');
var Pie = require('./charts/Pie');
var Q = require('q');

var config = require('../conf/config');

/** components */
var LoadingMask = require('./LoadingMask');
var LogLine = require('./charts/LogLine');
var Bar = require('./charts/Bar');

/** Utils */
var DataAPI = require('../utils/DataAPI');

/** constants */

module.exports = React.createClass({

    getInitialState: function () {
        return {
            currentTab: this.props.initialTab,
            loaded: false,
            rankingData: []
        };
    },

    getDefaultProps: function () {
        return {
            initialTab: 'task',
            start: new Moment().startOf('day'),
            end: new Moment().endOf('day'),
            tabs: ['tags', 'classes', 'project', 'version', 'task']
        };
    },

    render: function () {
        var map = {
            tags: {label: 'Tags', id: 'tags'},
            classes: {label: 'Classes', id: 'classes'},
            project: {label: 'Project', id: 'project'},
            version: {label: 'Version', id: 'version'},
            task: {label: 'task', id: 'task'}
        };
        return (
            <div className={"ltt_c-TimeConsumeRanking " + (this.props.className || "")}>
                <TabbedArea defaultActiveKey={this.props.initialTab}
                    activeKey={this.state.currentTab}
                    animation={false}
                    onSelect={this.handleTabSelect}>
                    {this.props.tabs.map(function (type) {
                        var tab = map[type];
                        return (
                            <TabPane eventKey={type} tab={tab.label}>
                                {this.renderPane(tab.id)}
                            </TabPane>
                        );
                    }, this)}
                <LoadingMask loaded={this.state.loaded}/>
                </TabbedArea>
            </div>
        );
    },

    renderPane: function (rankType) {
        if (rankType !== this.state.currentTab) {
            return null;
        }
        return (
            !_.isEmpty(this.state.rankingData) ? this.renderRankingData(rankType, this.state.rankingData) : null
        );
    },

    renderRankingData: function (rankType, data) {
        return <Bar data={rankType === 'classes' ? this.convertClassesData(data) : this.convertData(data)} exporting={false} labelWidth={this._width * 0.3} legend={false}/>
    },

    componentDidMount: function () {
        this.loadRankingData(this.props.initialTab);
        this._width = $(this.getDOMNode()).width();
    },


    componentWillReceiveProps: function (nextProps) {
        this.loadRankingData(this.state.currentTab, nextProps.params);
    },

    handleTabSelect: function (key) {
        this.setState({
            currentTab: key,
            rankingData: [],
            loaded: false
        }, function () {
            var that = this;
            this.loadRankingData(key)
        });
    },

    loadRankingData: function (rankType, params) {
        var that = this;
        var requestParmas = extend({
            sum: true,
            group: rankType
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