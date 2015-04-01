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

    render: function () {
        var goals = this.props.goals;
        return (
            <div className="ltt_c-GoalList">
                {goals.map(function (goal) {
                    return <GoalCard goal={goal}/>
                })}
            </div>
        );
    }

});