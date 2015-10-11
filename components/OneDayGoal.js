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
var RB =require('react-bootstrap');
var OverlayTrigger = RB.OverlayTrigger;
var Tooltip = RB.Tooltip;

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

    update: function () {
        var refs = this.refs;
        this.state.goals.forEach(function (goal){
            var goalRef = refs[goal._id];
            if (goalRef) {
                goalRef.update();
            }
        });
    },

    render: function () {
        var date = this.props.date;
        return (
            <div className="ltt_c-OneDayGoal">
            {this.state.goals.map(function (goal) {
                return <Goal data={goal}  date={date} key={goal._id} ref={goal._id} onLoaded={this.props.onLoaded}/>
            }, this)}
            </div>
        );
    },
});


var Goal = React.createClass({

    getDefaultProps: function () {
        return {
            onLoaded: function () {}
        };
    },

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
        var todayTime = this.state.todayTime
        this._todayProgress = (todayTime / oneDayTime * 100);
        this._totalProgress = (this.state.totalTime / estimatedTime * 100);
        this._todayProgressOfTotal = (todayTime / estimatedTime * 100);
        var tooltip = (
            <Tooltip>
                {Util.displayTime(oneDayTime)} / <strong>{Util.displayTime(todayTime)}</strong>
            </Tooltip>
        );
        return <div className="ltt_c-OneDayGoal-goal">
            <p className="ltt_c-OneDayGoal-goal-name" ref="goalName">
                <OverlayTrigger placement="bottom" overlay={tooltip} delay={0}>
                    <span className="ltt_c-OneDayGoal-goal-name-text">{goal.name}</span>
                </OverlayTrigger>
            </p>
            <p className="ltt_c-OneDayGoal-goal-charts">
                {this.state.calculated ?
                <div className="ltt_c-OneDayGoal-goal-progress">
                    <div className="pieChart todayProgress" ref="todayProgress" data-percent={this._todayProgress}>{this._todayProgress.toFixed(1) + '%'}</div>
                    <div className="pieChart totalProgress" ref="totalProgress" data-percent={this._totalProgress}>{this._totalProgress.toFixed(1) + '%'}</div>
                    <div className="pieChart todayProgressOfTotal" data-percent={this._todayProgressOfTotal} ref="todayProgressOfTotal">{this._todayProgressOfTotal.toFixed(1) + '%'}</div>
                </div>
                :
                <div className="fa fa-spinner fa-spin"></div>
            }
            </p>
        </div>
    },



    componentWillReceiveProps: function (nextProps) {
        if (this.props.date !== nextProps.date) {
            this._todayProgress = 0;
            this._totalProgress = 0;
            this._todayProgressOfTotal = 0;
            this.calculate(nextProps.date)
                .then(this._draw.bind(this))
                .then(function () {
                    this.props.onLoaded(this.props.data);
                }.bind(this));
        }
    },

    _createChart: function (element, percent) {
        var colors = ['#86e01e', '#f2d31b', '#f2b01e', '#f27011', '#f63a0f'].reverse();
        var max = 100;
        var level = percent < max ? (Math.ceil(percent/ (max / colors.length)) - 1) : (colors.length - 1);
        return new EasyPieChart(element, {size: 70, barColor: colors[level]});
    },

    componentDidMount: function () {
        this._calculateDataAndDraw();
    },

    update: function () {
        this._calculateDataAndDraw();
    },

    _calculateDataAndDraw: function () {
        this.calculate()
            .then(this._draw.bind(this))
            .then(function () {
                this.props.onLoaded(this.props.data);
            }.bind(this));
    },

    _draw: function () {
        this._createChart(this.refs.todayProgress.getDOMNode(), this._todayProgress);
        this._createChart(this.refs.totalProgress.getDOMNode(), this._totalProgress);
        this._createChart(this.refs.todayProgressOfTotal.getDOMNode(), this._todayProgressOfTotal);
    },

    calculate: function (date) {
        var deferred = Q.defer();
        var that = this;
        var goal = this.props.data;
        date = date || this.props.date;
        Q.all([
            this.getTodayTime(goal, date),
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