/**
 * @jsx React.DOM
 */

var React = require('react');
var Moment = require('moment');
var _ = require('lodash');
var PureRenderMixin = require('react/addons').addons.PureRenderMixin;
var ReactBootStrap = require('react-bootstrap');
var TabbedArea = ReactBootStrap.TabbedArea;
var TabPane = ReactBootStrap.TabPane;
var numeral = require('numeral');
var Router = require('react-router');

/** Components */
var CalendarHeatMap = require('../components/charts/CalendarHeatMap');
var SleepPeriod = require('../components/charts/SleepPeriod');
var MonthCountDown = require('../components/charts/MonthCountDown');
var TaskList = require('../components/Task/TaskList');
var Task = require('../components/Task/Task');
var LoadingMask = require('../components/LoadingMask');
var Board = require('../components/Borad');
var LogClassPie = require('../components/LogClassPie');
var Settings = require('./Settings');

/** Utils */
var DataAPI = require('../utils/DataAPI');
var Util = require('../utils/Util');

/**
 <div className="ltt_c-page-com">
                    <p className="ltt_c-page-title">Sleep Period</p>
                    <SleepPeriod title="Last 30 Day's Sleep Period"
                        url="/api/sleepPeriods"
                        start={new Moment().subtract(30, 'days').toDate()}
                        end={new Moment().toDate()}/>
                </div>
 */

var DATE_FORMAT = 'YYYY-MM-DD HH:mm:ss';
var Dashboard = React.createClass({

    mixins: [PureRenderMixin],

    render: function () {
        return (
            <div className="ltt_c-page ltt_c-page-dashboard">
                <Board/>
                <div className="ltt_c-page-com">
                    <RecentActivity initialTab={'today'}/>
                </div>
                <div className="ltt_c-page-com">
                    <p className="ltt_c-page-title">Sport Cal-Heatmap</p>
                    <CalendarHeatMap
                        data={this.loadSportCalendar}
                        empty="no sport data"
                        filled="{date} 运动时间 {count}分钟"/>
                </div>
                <div className="ltt_c-page-com">
                    <p className="ltt_c-page-title">Meditation</p>
                    <CalendarHeatMap
                        data={this.loadMeditationCalendar}
                        empty="do not meditate this day"
                        filled="{date} meditate {count}"/>
                </div>
                <div className="ltt_c-page-com">
                    <p className="ltt_c-page-title">Thinking</p>
                    <CalendarHeatMap
                        data={this.loadThinkingCalendar}
                        empty="do not meditate this day"
                        filled="{date} meditate {count}"/>
                </div>
                <div className="Grid Grid--gutters Grid--stretch">
                    <div className="Grid-cell u-1of3">
                        <MonthCountDown height={250} padding={0}
                            itemPadding={2} lifeYear={70} birthday='1989-10-23'/>
                    </div>
                    <div className="Grid-cell u-1of3" ref="logClassPieContainer">
                        <LogClassPie title="All Time's Class distribution" start={new Moment(Settings.get('startDate'))} end={new Moment()} compare={false} legend={true}/>
                    </div>
                </div>
            </div>
        );
    },


    loadSportCalendar: function () {
        return DataAPI.Log.load({
            sum: true,
            group: 'date.day',
            start: new Moment().startOf('month').subtract(1, 'year').toDate(),
            end: new Moment().endOf('month').toDate(),
            classes: 'SPR'
        }).then(function (data) {
            return data.map(function (item) {
                return {
                    date: item._id,
                    count: item.totalTime
                }
            });
        });
    },


    loadMeditationCalendar: function () {
        return DataAPI.Log.load({
            sum: true,
            group: 'date.day',
            start: new Moment().startOf('month').subtract(1, 'year').toDate(),
            end: new Moment().endOf('month').toDate(),
            tags: 'meditation'
        }).then(function (data) {
            return data.map(function (item) {
                return {
                    date: item._id,
                    count: item.totalTime
                }
            });
        });
    },

    loadThinkingCalendar: function () {
        return DataAPI.Log.load({
            sum: true,
            group: 'date.day',
            start: new Moment().startOf('month').subtract(1, 'year').toDate(),
            end: new Moment().endOf('month').toDate(),
            classes: 'TK'
        }).then(function (data) {
            return data.map(function (item) {
                return {
                    date: item._id,
                    count: item.totalTime
                }
            });
        });
    }

});

var RecentActivity = React.createClass({

    mixins: [PureRenderMixin, Router.State, Router.Navigation],

    getInitialState: function () {
        return {
            currentTab: this.props.initialTab,
            loaded: false
        };
    },

    getDefaultProps: function () {
        return {
            initialTab: 'today'
        };
    },

    componentDidMount: function () {
        this.loadTask(this.props.initialTab);
    },

    render: function () {
        return (
            <div class="ltt_c-RecentActivity">
                <p className="ltt_c-page-title">Recent Activity</p>
                <TabbedArea defaultActiveKey={this.props.initialTab} activeKey={this.state.currentTab} animation={false} onSelect={this.handleTabSelect}>
                    <TabPane eventKey="yesterday" tab="Yesterday">
                        {this.renderPane('yesterday')}
                    </TabPane>
                    <TabPane eventKey="today" tab="Today">
                        {this.renderPane('today')}
                    </TabPane>
                    <TabPane eventKey="weekly" tab="Weekly">
                        {this.renderPane('weekly')}
                    </TabPane>
                    <TabPane eventKey="last_three_day" tab="Last Three Day">
                        {this.renderPane('last_three_day')}
                    </TabPane>
                    <TabPane eventKey="last_seven_day" tab="Last Seven Days">
                        {this.renderPane('last_seven_day')}
                    </TabPane>
                    <TabPane eventKey="monthly" tab="Monthly">
                        {this.renderPane('monthly')}
                    </TabPane>
                    <TabPane eventKey="last_month" tab="Last Month">
                        {this.renderPane('last_month')}
                    </TabPane>
                    <LoadingMask loaded={this.state.loaded} />
                </TabbedArea>
            </div>
        );
    },

    renderPane: function (type) {
        var data = this.state[type + 'Task'];
        var that = this;
        return (
            <div className="ltt_c-RecentActivity-content">
               {this.renderButtonGroup(type)}
               <TaskList>
                    {!_.isEmpty(data) ? data.map(function (task) {
                        return <Task data={task}
                            onTitleClick={that.gotoTaskInProject.bind(that, task)}
                            key={task._id}/>
                    }) : <EmptyMsg/>}
                </TaskList>
            </div>
        );
    },

    gotoTaskInProject: function (task) {
        var url = Util.getUrlFromTask(task);
        if (url) {
            this.transitionTo(url);
        }
    },

    renderButtonGroup: function (type) {
        return (
            <div className="btn-group">
                <button className="btn btn-xs" onClick={this.loadDoing.bind(this, type)}>Doing</button>
                <button className="btn btn-xs" onClick={this.loadDone.bind(this, type)}>Done</button>
            </div>
        );
    },

    handleTabSelect: function (key) {
        this.setState({
            currentTab: key
        }, function () {
            this.loadTask(key);
        });
    },

    loadTask: function (type, params) {
        var that = this;
        this.setState({loaded: false});
        params = _.extend({status: 'doing', calculateTimeConsume: true, parent: 'null', populate: true}, params);
        _.extend(params, Util.toDate(type));
        DataAPI.Task.load(params).then(function (tasks) {
            var data = {loaded: true};
            data[ type + 'Task'] = tasks;
            that.setState(data);
        });
    },

    loadDoing: function (type) {
        this.loadTask(type, {status: 'doing'});
    },

    loadDone: function (type) {
        this.loadTask(type, {status: 'done'});
    }
});


var EmptyMsg = React.createClass({

    render: function () {
        return <div className="empty-task">没有任务</div>
    }
});

module.exports = Dashboard;
