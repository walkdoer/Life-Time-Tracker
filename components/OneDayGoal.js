/**
 * @jsx React.DOM
 */
'use strict';

var React = require('react');
var $ = require('jquery');
var _ = require('lodash');
var PureRenderMixin = require('react/addons').addons.PureRenderMixin;
var ReactBootStrap = require('react-bootstrap');
var Q = require('q');
var Moment = require('moment');

/** Utils */
var Util = require('../utils/Util');
var DataAPI = require('../utils/DataAPI');

/** Actions */
var GoalAction = require('../actions/GoalAction');

/** Store */
var GoalStore = require('../stores/GoalStore');



var OneDayGoal = React.createClass({

    getInitialState: function () {
        return this.getStateFromStore();
    },

    getStateFromStore: function () {
        return {
            loaded: GoalStore.loaded,
            loadError: GoalStore.loadError,
            goals: GoalStore.goals
        };
    },

    componentDidMount: function () {
        GoalStore.addChangeListener(this._onStoreChange);
        GoalAction.load();
    },

    _onStoreChange: function () {
        this.setState(this.getStateFromStore());
    },

    componentWillUnmount: function () {
        GoalStore.removeChangeListener(this._onStoreChange);
    },

    render: function () {
        return (
            <div className="ltt_c-OneDayGoal">
            {this.state.goals.map(function (goal) {
                return <Goal data={goal} key={goal._id}/>
            })}
            </div>
        );
    },
});


var Goal = React.createClass({

    getInitialState: function () {
        return {
            calculated: false
        };
    },

    render: function () {
        var goal = this.props.data;
        var dateInfo = Util.toDate(goal.granularity);
        var estimatedTime = goal.estimatedTime;
        var oneDayTime = estimatedTime / dateInfo.diff;
        return <div className="ltt_c-OneDayGoal-goal">
            <p className="goal-name">{goal.name}</p>
            <p>
                {this.state.calculated ?
                <span className="progress">
                    <span className="today">今日目标完成了: ({(this.state.todayTime / oneDayTime * 100).toFixed(1)})</span>
                    <span className="total">总目标: ({(this.state.totalTime / estimatedTime * 100).toFixed(1)})</span>
                    <span className="todayProgress">今日推进了: ({(this.state.todayTime / estimatedTime * 100).toFixed(1)})</span>
                </span>
                :
                <span className="fa fa-spinner fa-spin"></span>
            }
            </p>
        </div>
    },

    componentDidMount: function () {
        this.calculate();
    },

    calculate: function () {
        var that = this;
        var goal = this.props.data;
        return Q.all([
            this.getTodayTime(goal),
            this.getTotalTime(goal)
        ]).spread(function (todayTime, totalTime) {
            that.setState({
                calculated: true,
                todayTime: todayTime,
                totalTime: totalTime
            });
        }).catch(function (err) {
            console.error(err.stack);
        });
    },

    getTotalTime: function (goal) {
        var dateInfo = Util.toDate(goal.granularity);
        return this._calculateTime(goal, dateInfo);
    },

    getTodayTime: function (goal) {
        var date = this.props.date;
        return this._calculateTime(goal, {
            start: new Moment(date).startOf('day').toDate(),
            end: new Moment(date).endOf('day').toDate()
        });
    },

    _calculateTime: function (goal, userParams) {
        var params = _.extend({
            sum: true
        }, JSON.parse(goal.filter), userParams);
       return DataAPI.Log.load(params)
            .then(function (data) {
                data = data[0];
                return data ? data.totalTime || 0 : 0;
            });
    }
})



module.exports = OneDayGoal;