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

/** Components */
var CalendarHeatMap = require('../components/charts/CalendarHeatMap');
var SleepPeriod = require('../components/charts/SleepPeriod');
var MonthCountDown = require('../components/charts/MonthCountDown');
var TaskList = require('../components/Task/TaskList');
var Task = require('../components/Task/Task');
var LoadingMask = require('../components/LoadingMask');

/** Utils */
var DataAPI = require('../utils/DataAPI');

var Dashboard = React.createClass({

    mixins: [PureRenderMixin],

    render: function () {
        return (
            <div className="ltt_c-page ltt_c-page-dashboard">
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
                    <p className="ltt_c-page-title">Sleep Period</p>
                    <SleepPeriod title="Last 30 Day's Sleep Period"
                        url="/api/sleepPeriods"
                        start={new Moment().subtract(30, 'days').toDate()}
                        end={new Moment().toDate()}/>
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

var RecentActivity = React.createClass({

    mixins: [PureRenderMixin],

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
                    <LoadingMask loaded={this.state.loaded} />
                </TabbedArea>
            </div>
        );
    },

    renderPane: function (type) {
        var data = this.state[type + 'Task'];
        return (
            <div className="ltt_c-RecentActivity-content">
               {this.renderButtonGroup(type)}
               <TaskList>
                    {!_.isEmpty(data) ? data.map(function (task) {
                        return <Task data={task}
                            key={task._id}/>
                    }) : <EmptyMsg/>}
                </TaskList>
            </div>
        );
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
        params = _.extend({status: 'doing', calculateTimeConsume: true}, params);
        if (type === 'yesterday') {
            params.start = new Moment().subtract(1, 'day').startOf('day').toDate();
            params.end = new Moment().subtract(1, 'day').endOf('day').toDate();
        } else if (type === 'weekly') {
            params.start = new Moment().startOf('week').toDate();
            params.end = new Moment().endOf('week').toDate();
        } else if ( type === 'today') {
            params.start = new Moment().startOf('day').toDate();
            params.end = new Moment().endOf('day').toDate();
        }
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
