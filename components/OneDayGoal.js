/**
 * @jsx React.DOM
 */
'use strict';

var React = require('react');
var $ = require('jquery');
var _ = require('lodash');
var PureRenderMixin = require('react/addons').addons.PureRenderMixin;
var ReactBootStrap = require('react-bootstrap');
var Moment = require('moment');


/** Actions */
var GoalAction = require('../actions/GoalAction');

/** Store */
var GoalStore = require('../stores/GoalStore');

/* Components */


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
        if (GoalStore.createSuccess) {
            this.refs.modalTrigger.hide();
        }
        if (GoalStore.updateSuccess) {
            this.refs.goalList.update(GoalStore.updateGoal);
        }
        this.setState(this.getStateFromStore());
    },

    componentWillUnmount: function () {
        GoalStore.removeChangeListener(this._onStoreChange);
    },

    render: function () {

    }
});



module.exports = OneDayGoal;