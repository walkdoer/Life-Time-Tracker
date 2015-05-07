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
var classesMap = require('../conf/config').classesMap;
var logClasses = _.pairs(classesMap).map(function (obj) {
    return {
        value: obj[0],
        text: obj[1]
    };
});

/** Components */
var CalendarHeatMap = require('../components/charts/CalendarHeatMap');
var SleepPeriod = require('../components/charts/SleepPeriod');
var MonthCountDown = require('../components/charts/MonthCountDown');
var TaskList = require('../components/Task/TaskList');
var Task = require('../components/Task/Task');
var LoadingMask = require('../components/LoadingMask');

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
                <div className="ltt_c-page-com">
                    <MonthCountDown width={350} height={250} padding={0}
                        itemPadding={2} lifeYear={70} birthday='1989-10-23'/>
                </div>
            </div>
        );
    },


    loadSportCalendar: function () {
        return DataAPI.calendar({
            start: new Moment().startOf('month').subtract(1, 'year').toDate(),
            end: new Moment().endOf('month').toDate(),
            classes: 'SPR'
        });
    },


    loadMeditationCalendar: function () {
        return DataAPI.calendar({
            start: new Moment().startOf('month').subtract(1, 'year').toDate(),
            end: new Moment().endOf('month').toDate(),
            tags: 'meditation'
        });
    },

    loadThinkingCalendar: function () {
        return DataAPI.calendar({
            start: new Moment().startOf('month').subtract(1, 'year').toDate(),
            end: new Moment().endOf('month').toDate(),
            classes: 'TK'
        });
    }

});

var Board = React.createClass({

    mixins: [PureRenderMixin],

    getInitialState: function () {
        return {
            loaded: false
        };
    },

    render: function () {
        var today = this.state.today;
        var yesterday = this.state.yesterday;
        var logClassTime, yesterDayLogClassTime;
        if (today) {
            logClassTime = today.classTime;
        }
        if (yesterday) {
            yesterDayLogClassTime = yesterday.classTime;
        }
        return (
            <div className="ltt_c-Board">
                {logClasses.map(function (logClass) {
                    var time = 0, yesterdayTime;
                    var classId = logClass.value;
                    var data;
                    if (!_.isEmpty(logClassTime)) {
                        data = logClassTime.filter(function(item) {
                            return item.id === classId;
                        })[0];
                        if (data) {
                            time = data.count;
                        }
                    }
                    if (!_.isEmpty(yesterDayLogClassTime)) {
                        data = yesterDayLogClassTime.filter(function(item) {
                            return item.id === classId;
                        })[0];
                        if (data) {
                            yesterdayTime = data.count;
                        }
                    }
                    var progressNumber, progressPercentage, progress;
                    console.log(yesterdayTime);
                    if (yesterdayTime > 0) {
                        progressNumber = time - yesterdayTime;
                        progressPercentage = progressNumber / yesterdayTime;
                        progress = (
                            <span className={progressNumber > 0 ? 'rise' : (progressNumber < 0 ? 'down' : 'equal')}>
                                <i className={"fa fa-" + (progressNumber > 0 ? 'long-arrow-up' :
                                    (progressNumber < 0 ? 'long-arrow-down' : 'minus'))}></i>
                                {numeral(progressPercentage * 100).format('0.0')}%
                            </span>
                        );
                    }
                    return (
                        <div className="ltt_c-Board-item">
                            <p className="ltt_c-Board-item-number">{time}</p>
                            <p className="ltt_c-Board-item-name">{logClass.text}</p>
                            <p className="ltt_c-Board-item-change">{progress}</p>
                        </div>
                    );
                })}
                <LoadingMask loaded={this.state.loaded}/>
            </div>
        );
    },

    componentDidMount: function (argument) {
        var that = this;
        DataAPI.stat({
            start: new Moment().startOf('day').format(DATE_FORMAT),
            end: new Moment().endOf('day').format(DATE_FORMAT)
        }).then(function (statResult) {
            that.setState({
                loaded: true,
                today: statResult
            });
        }).then(function () {
            return DataAPI.stat({
                start: new Moment().subtract(1, 'day').startOf('day').format(DATE_FORMAT),
                end: new Moment().subtract(1, 'day').endOf('day').format(DATE_FORMAT)
            });
        }).then(function (statResult) {
            that.setState({
                yesterday: statResult
            });
        });
    }
})

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
