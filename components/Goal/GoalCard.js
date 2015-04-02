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

/** Constant */
var EMPTY_FUN = function () {};
var ID_PREFIX = "ltt_c-GoalCard-filterEditor";

module.exports = React.createClass({

    getInitialState: function () {
        return {
            progress: 0
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
                <div className="ltt_c-GoalCard-item ltt_c-GoalCard-activities">recent activities</div>
                <div className="ltt_c-GoalCard-item ltt_c-GoalCard-progress"><Progress className="ltt_c-GoalCard-progress" max={goal.estimatedTime} value={this.state.progress}/></div>
                <span className="ltt_c-GoalCard-editBtn" onClick={this.editing}><i className="fa fa-pencil-square"></i></span>
            </div>
        )
    },

    componentDidMount: function () {
        this.calculateProgress();
    },

    calculateProgress: function () {
        this.setState({
            progress: 40
        });
    },

    editing: function () {
        this.setState({
            editing: true
        }, function () {
            this.initEditor();
        });
    },

    initEditor: function () {
        var goal = this.props.goal;
        var editor = ace.edit( ID_PREFIX + goal.id);
        this.editor = editor;
        editor.setTheme("ace/theme/github");
        editor.renderer.setShowGutter(false); //hide the linenumbers
        var session = editor.getSession();
        session.setMode("ace/mode/json");
        session.setUseWrapMode(true);
        editor.setOptions({
            enableSnippets: true,
            enableBasicAutocompletion: true,
            enableLiveAutocompletion: false
        });
    }
});