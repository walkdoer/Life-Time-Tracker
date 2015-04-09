/**
 * @jsx React.DOM
 */
var React = require('react');
var cx = React.addons.classSet;
var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;
var Router = require('react-router');
var Moment = require('moment');
var Link = Router.Link;
var Q = require('q');
var _ = require('lodash');
var RB = require('react-bootstrap');
var Input = RB.Input;
var DropdownButton = RB.DropdownButton;
var MenuItem = RB.MenuItem;


/**components*/
var Progress = require('../Progress');
var DataAPI = require('../../utils/DataAPI');
var LogLine = require('../charts/LogLine');
var LoadingMask = require('../LoadingMask');

/** Constant */
var EMPTY_FUN = function () {};

module.exports = React.createClass({

    getInitialState: function () {
        return {
            progress: 0,
            activitiesLoaded: false,
            activitiesLoadFailed: false,
            activities: []
        };
    },

    getDefaultProps: function () {
        return {};
    },

    render: function () {
        var goal = this.props.goal;
        var innerDropdown = <DropdownButton title='Granularity'>
            <MenuItem key='year'>year</MenuItem>
            <MenuItem key='month'>month</MenuItem>
            <MenuItem key='week'>week</MenuItem>
            <MenuItem key='day'>day</MenuItem>
        </DropdownButton>
        return (
            <div className={cx({"ltt_c-GoalCard": true, editing: this.state.editing})}>
                <div className="ltt_c-GoalCard-item ltt_c-GoalCard-title">{goal.name}</div>
                <div className="ltt_c-GoalCard-item ltt_c-GoalCard-granularity">{goal.granularity}</div>
                <div className="ltt_c-GoalCard-item ltt_c-GoalCard-activities">
                    {this.state.activitiesLoadFailed ?
                        'Load Activity Failed' :
                        (goal.filter ? <LogLine logs={this.state.activities} title={false} xAxisLabel={false}/> : null)
                    }
                    <LoadingMask loaded={this.state.activitiesLoaded}/>
                </div>
                <div className="ltt_c-GoalCard-item ltt_c-GoalCard-progress">
                    <Progress className="ltt_c-GoalCard-progress" max={goal.estimatedTime || 0} value={this.state.progress || 0}/>
                </div>
                <span className="ltt_c-GoalCard-editBtn" onClick={this.editing}><i className="fa fa-pencil-square"></i></span>
            </div>
        )
    },

    componentDidMount: function () {
        //this.calculateProgress();
        var goal = this.props.goal;
        var filter;
        if (goal && (filter = goal.filter)) {
            this.loadActivities(JSON.parse(filter));
        } else {
            this.setState({
                activitiesLoaded: true
            });
        }
    },

    loadActivities: function (filter) {
        console.log(filter);
        var that = this;
        var params = _.extend({
            sort: 'date: -1',
            populate: false
        }, filter);
        DataAPI.Log.load(params)
            .then(function (data) {
                that.setState({
                    activitiesLoaded: true,
                    activities: data
                }, function () {
                    this.calculateProgress();
                });
            }).fail(function (err) {
                that.setState({
                    activitiesLoaded: true,
                    activitiesLoadFailed: true
                })
            });
    },

    calculateProgress: function () {
        var totalTime = this.state.activities.reduce(function (total, log) {
            return total + (log.len || 0);
        }, 0);
        this.setState({
            progress: totalTime
        });
    }
});