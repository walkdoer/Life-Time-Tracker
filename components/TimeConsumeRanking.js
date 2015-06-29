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
            end: new Moment().endOf('day')
        };
    },

    render: function () {
        return (
            <div className={"ltt_c-TimeConsumeRanking " + (this.props.className || "")}>
                <TabbedArea defaultActiveKey={this.props.initialTab}
                    activeKey={this.state.currentTab}
                    animation={false}
                    onSelect={this.handleTabSelect}>
                    <TabPane eventKey="project" tab="Project">
                        {this.renderPane('project')}
                    </TabPane>
                    <TabPane eventKey="version" tab="Version">
                        {this.renderPane('version')}
                    </TabPane>
                    <TabPane eventKey="task" tab="Task">
                        {this.renderPane('task')}
                    </TabPane>
                </TabbedArea>
            </div>
        );
    },

    renderPane: function (rankType) {
        return (
            !_.isEmpty(this.state.rankingData) ? this.renderRankingData(this.state.rankingData) : 'No data to display'
        );
    },

    renderRankingData: function (data) {
        return <Bar data={this.convertData(data)} labelWidth={this._width * 0.3} legend={false}/>
    },

    componentDidMount: function () {
        this.loadRankingData(this.props.initialTab);
        this._width = $(this.getDOMNode()).width();
    },

    handleTabSelect: function (key) {
        this.setState({
            currentTab: key,
            loaded: false
        }, function () {
            var that = this;
            this.loadRankingData(key)
        });
    },

    loadRankingData: function (rankType) {
        var that = this;
        DataAPI.Log.load({
            start: this.props.start.toDate(),
            end: this.props.start.toDate(),
            sum: true,
            group: rankType
        }).then(function (list) {
            return list.sort(function (a, b){
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
    }
});