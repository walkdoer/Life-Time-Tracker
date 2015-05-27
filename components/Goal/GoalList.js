/**
 * @jsx React.DOM
 */
var React = require('react');
var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;
var Router = require('react-router');
var Moment = require('moment');
var Link = Router.Link;
var Q = require('q');
var _ = require('lodash');

/** Actions */
var GoalAction = require('../../actions/GoalAction');

/** Stores */
var GoalStore = require('../../stores/GoalStore');

/**components*/
var Progress = require('../Progress');
var GoalCard = require('../Goal/GoalCard');

/** Utils */
var DataAPI = require('../../utils/DataAPI');

/** Constant */
var EMPTY_FUN = function () {};

module.exports = React.createClass({

    getInitialState: function () {
        return {};
    },

    getDefaultProps: function () {
        return {
            goals: []
        };
    },

    componentWillMount: function () {
        GoalStore.addChangeListener(this._onStoreChange);
    },

    _onStoreChange: function () {
        var goal = GoalStore.updateGoal;
        if (GoalStore.updateSuccess) {
            var goalCard = this.refs[goal._id];
            if (goalCard) {
                goalCard.updated();
            }
        }
    },

    getStateFromStore: function () {
        return _.pick(GoalStore, ['updateSuccess']);
    },

    componentWillUnmount: function () {
        GoalStore.removeChangeListener(this._onStoreChange);
    },


    render: function () {
        var goals = this.props.goals;
        return (
            <div className="ltt_c-GoalList">
                {goals.map(function (goal) {
                    return <GoalCard key={goal._id} ref={goal._id} goal={goal} onUpdate={this.onUpdate}/>
                }, this)}
            </div>
        );
    },

    onUpdate: function (goal) {
        GoalAction.update(goal);
    }


});