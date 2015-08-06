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

    propTypes: {
        pieSize: React.PropTypes.number.isRequired
    },

    getDefaultProps: function () {
        return {
            pieSize: 45
        };
    },

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
        var date = this.props.date;
        return (
            <div className="ltt_c-TodayGoal">
            {this.state.goals.map(function (goal) {
                return <Goal data={goal} date={date} key={goal._id} pieSize={this.props.pieSize} ref={goal._id}/>
            }, this)}
            </div>
        );
    },
});


var Goal = React.createClass({

    propTypes: {
        max: React.PropTypes.number,
        pieSize: React.PropTypes.number.isRequired
    },

    getDefaultProps: function () {
        return {
            max: 100,
            pieSize: 45
        };
    },

    getInitialState: function () {
        return {
            calculated: false,
            todayTime: 0
        };
    },

    render: function () {
        var goal = this.props.data;
        var dateInfo = Util.toDate(goal.granularity);
        var estimatedTime = goal.estimatedTime;
        var oneDayTime = estimatedTime / dateInfo.diff;
        this._todayProgress = (this.state.todayTime / oneDayTime * 100);
        return (
            <div className="ltt_c-TodayGoal-goal Grid">
                <div style={{width: this.props.pieSize}} className="ltt_c-TodayGoal-goal-progress">
                    <div className="pieChart todayProgress" ref="todayProgress" data-percent={this._todayProgress}>{this._todayProgress.toFixed(1) + '%'}</div>
                </div>
                <div className="Grid-cell">
                    {goal.name}
                    <span className="ltt_c-TodayGoal-goal-time">{Util.displayTime(oneDayTime)}</span>
                </div>
            </div>
        );
    },


    componentWillReceiveProps: function (nextProps) {
        if (this.props.date !== nextProps.date) {
            this._todayProgress = 0;
            this.calculate(nextProps.date).then(this._draw.bind(this));
        }
    },

    _createChart: function (element, percent) {
        var colors = ['#86e01e', '#f2d31b', '#f2b01e', '#f27011', '#f63a0f'].reverse();
        var max = this.props.max;
        var level = percent < max ? (Math.ceil(percent/ (max / colors.length)) - 1) : (colors.length - 1);
        return new EasyPieChart(element, {size: this.props.pieSize, barColor: colors[level]});
    },

    componentDidMount: function () {
        this.calculate().then(this._draw.bind(this));
    },

    _draw: function () {
        this._createChart(this.refs.todayProgress.getDOMNode(), this._todayProgress);
    },

    calculate: function (date) {
        var deferred = Q.defer();
        var that = this;
        var goal = this.props.data;
        date = date || this.props.date;
        this.getTodayTime(goal, date).then(function (todayTime) {
            var result = {
                calculated: true,
                todayTime: todayTime
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

    getTodayTime: function (goal, date) {
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