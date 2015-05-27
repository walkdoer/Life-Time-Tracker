/**
 * @jsx React.DOM
 */

var React = require('react');
var $ = require('jquery');
var Moment = require('moment');
var ReactBootStrap = require('react-bootstrap');
var Button = ReactBootStrap.Button;
var Modal = ReactBootStrap.Modal;
var ModalTrigger = ReactBootStrap.ModalTrigger;
var Input = ReactBootStrap.Input;
var ReactPropTypes = React.PropTypes;
var numeral = require('numeral');
var cx = require('react/lib/cx');
var _ = require('lodash');


/** Components */
var GoalList = require('../components/Goal/GoalList');
var TimeInput = require('../components/TimeInput');
var CreateAddGoalModal = require('../components/Goal/GoadEditWindow');

/** Actions */
var GoalAction = require('../actions/GoalAction');

/** Store */
var GoalStore = require('../stores/GoalStore');

/** utils */
var DataAPI = require('../utils/DataAPI');


module.exports = React.createClass({

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
            return;
        }
        this.setState(this.getStateFromStore());
    },

    componentWillUnmount: function () {
        GoalStore.removeChangeListener(this._onStoreChange);
    },

    render: function () {
        return (
            <div className="ltt_c-page-Goals">
                <h3>
                    Goals
                    <ModalTrigger modal={<CreateAddGoalModal onSave={this.addGoal}/>} ref="modalTrigger">
                        <Button bsSize="medium" style={{float: 'right'}}>New Goal</Button>
                    </ModalTrigger>
                </h3>
                <GoalList goals={this.state.goals}/>
            </div>
        );
    },

    addGoal: function (goal) {
        GoalAction.create(goal);
    }
});