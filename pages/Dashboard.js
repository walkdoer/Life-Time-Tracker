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
var VerticleTimeline = require('../components/VerticleTimeline');
var TodayGoal = require('../components/TodayGoal');
/** Utils */
var DataAPI = require('../utils/DataAPI');
var Util = require('../utils/Util');

/** Configs */
var config = require('../conf/config');

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
                <div className="Grid Grid--gutters">
                    <div className="Grid-cell u-2of3">
                        <div className="ltt_c-page-com">
                            <RecentActivity initialTab={'today'}/>
                        </div>
                        <div className="Grid Grid--gutters Grid--stretch">
                            <div className="Grid-cell u-2of3">
                                <div className="ltt_c-page-dashboard-com yesterdayGoals">
                                    <p className="ltt_c-page-title">Yesterday Goal Achievement</p>
                                    <TodayGoal date={new Moment().subtract(1, 'day').format(Util.DATE_FORMAT)}/>
                                </div>
                            </div>
                            <div className="Grid-cell u-1of3" ref="logClassPieContainer">
                                <LogClassPie title="All Time's Class distribution" start={new Moment(Settings.get('startDate'))} end={new Moment()} compare={false} legend={true}/>
                            </div>
                        </div>
                        <div className="ltt_c-page-com">
                            <p className="ltt_c-page-title">Sport Cal-Heatmap</p>
                            <CalendarHeatMap
                                getData={this.loadSportCalendar}
                                empty="no sport data"
                                filled="{date} 运动时间 {count}分钟"/>
                        </div>
                        <div className="ltt_c-page-com">
                            <p className="ltt_c-page-title">Meditation</p>
                            <CalendarHeatMap
                                getData={this.loadMeditationCalendar}
                                empty="do not meditate this day"
                                filled="{date} meditate {count}"/>
                        </div>
                        <div className="ltt_c-page-com">
                            <p className="ltt_c-page-title">Thinking</p>
                            <CalendarHeatMap
                                getData={this.loadThinkingCalendar}
                                empty="do not meditate this day"
                                filled="{date} think {count}"/>
                        </div>
                        <div className="Grid Grid--gutters Grid--stretch">
                            <div className="Grid-cell u-1of3">
                                <MonthCountDown height={250} padding={0}
                                    itemPadding={2} lifeYear={70} birthday={Settings.get('birthday')}/>
                            </div>
                        </div>
                    </div>
                    <ActivityLogs className="Grid-cell u-1of3"/>
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

var ActivityLogs = React.createClass({

    getInitialState: function () {
        return {
            activityLoaded: false,
            activitys: []
        };
    },

    componentDidMount: function () {
        var that = this;
        this.loadActivities().then(function (activitys){
            that.setState({
                activitys: activitys,
                activityLoaded: true
            });
        });
    },

    render: function () {
        return <div className={"ltt_c-ActivityLogs " + (this.props.className || '')}>
            <VerticleTimeline activitys={this.state.activitys}/>
            <LoadingMask loaded={this.state.activityLoaded}/>
        </div>
    },

    loadActivities: function () {
        return DataAPI.Log.load({
            skip: 0,
            limit: 10,
            populate: true,
            sort: 'start:-1'
        }).then(function (logs) {
            var classConfigs = config.classes;
            return logs.map(function (log) {
                log.classes = log.classes.map(function (clsId) {
                    return classConfigs.filter(function (cls) {
                        return cls._id === clsId;
                    })[0] || clasId;
                });
                return log;
            })
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
