/**
 * @jsx React.DOM
 */

var React = require('react');
var $ = require('jquery');
var Moment = require('moment');
var ReactBootStrap = require('react-bootstrap');
var Button = ReactBootStrap.Button;
var ReactPropTypes = React.PropTypes;
var numeral = require('numeral');
var cx = require('react/lib/cx');

/** constant */
var ENTER_KEY_CODE = 13;

/** Components */
var LoadingMask = require('../components/LoadingMask');
var Notify = require('../components/Notify');
var GoalList = require('../components/Goal/GoalList');

/** Actions */

/** utils */
var DataAPI = require('../utils/DataAPI');


module.exports = React.createClass({

    getInitialState: function () {
        return {
            goals: [{
                id: '1',
                name: '每周跑步',
                estimatedTime: 200,
                filter: {tag: ['跑步']},
                granularity: 'week'
            }, {
                id: '2',
                name: '每月读书',
                estimatedTime: 1800,
                filter: {tag: ['rb']},
                granularity: 'month'
            }]
        };
    },


    render: function () {
        return (
            <div className="ltt_c-page-Goals">
                <h3>Goals</h3>
                <GoalList goals={this.state.goals}/>
            </div>
        );
    },

    componentDidMount: function () {
        this.loadGoals();
    },

    loadGoals: function () {

    }

});