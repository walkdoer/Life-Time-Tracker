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
var EasyPieChart = require('easyPieChart');

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
        this._todayProgress = (this.state.todayTime / oneDayTime * 100).toFixed(1);
        this._totalProgress = (this.state.totalTime / estimatedTime * 100).toFixed(1);
        this._todayProgressOfTotal = (this.state.todayTime / estimatedTime * 100).toFixed(1);
        return <div className="ltt_c-OneDayGoal-goal">
            <p className="ltt_c-OneDayGoal-goal-name">{goal.name}</p>
            <p className="ltt_c-OneDayGoal-goal-charts">
                {this.state.calculated ?
                <div className="ltt_c-OneDayGoal-goal-progress">
                    <div className="pieChart todayProgress" ref="todayProgress" data-percent={this._todayProgress}>{this._todayProgress + '%'}</div>
                    <div className="pieChart totalProgress" ref="totalProgress" data-percent={this._totalProgress}>{this._totalProgress + '%'}</div>
                    <div className="pieChart todayProgressOfTotal" data-percent={this._todayProgressOfTotal} ref="todayProgressOfTotal">{this._todayProgressOfTotal + '%'}</div>
                </div>
                :
                <div className="fa fa-spinner fa-spin"></div>
            }
            </p>
        </div>
    },

    componentDidUpdate: function () {
        this._draw();
    },

    _createChart: function (element) {
        return new EasyPieChart(element, {size: 70});
    },

    componentDidMount: function () {
        this.calculate().then(function () {
            this._draw();
        });
    },

    _draw: function () {
        if (!this.drawed) {
            this._todayProgressChart = this._createChart(this.refs.todayProgress.getDOMNode(), this._todayProgress);
            this._totalProgressChart = this._createChart(this.refs.totalProgress.getDOMNode(), this._totalProgress);
            this._todayProgressOfTotalChart = this._createChart(this.refs.todayProgressOfTotal.getDOMNode(), this._todayProgressOfTotal);
            this.drawed = true;
        } else {
            this._todayProgressChart.update(this._todayProgress);
            this._totalProgressChart.update(this._totalProgress);
            this._todayProgressOfTotalChart.update(this._todayProgressOfTotal);
        }

    },

    calculate: function () {
        var deferred = Q.defer();
        var that = this;
        var goal = this.props.data;
        Q.all([
            this.getTodayTime(goal),
            this.getTotalTime(goal)
        ]).spread(function (todayTime, totalTime) {
            var result = {
                calculated: true,
                todayTime: todayTime,
                totalTime: totalTime
            };
            that.setState(result, function () {
                deferred.resolve(result);
            });
        }).catch(function (err) {
            console.error(err.stack);
            deferred.reject(err);
        });
        return deferred.promise;
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