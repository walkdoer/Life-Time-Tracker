/**
 * @jsx React.DOM
 */

var React = require('react');
var Moment = require('moment');
var Router = require('react-router');
var PureRenderMixin = require('react/addons').addons.PureRenderMixin;
var RB = require('react-bootstrap');
var Button = RB.Button;
var ButtonToolbar = RB.ButtonToolbar;

/** Components */
var Task = require('../Task/Task.js');
var TaskList = require('../Task/TaskList');

/** utils */
var DataAPI = require('../../utils/DataAPI');
var Util = require('../../utils/Util');

var ProjectIndex = React.createClass({

    mixins: [PureRenderMixin, Router.State, Router.Navigation],

    getInitialState: function () {
        return {
            markedTasks: [],
            dueTasks: [],
            showDone: false
        };
    },


    render: function () {
        var markedTasks = this.state.markedTasks;
        var dueTasks = this.state.dueTasks;
        var that = this;
        return (
            <div className="ltt_c-page-projectsNew-index">
                <h3>Marked Tasks</h3>
                <ButtonToolbar>
                    <Button bsSize='small' active={this.state.showDone} onClick={this.showDone}>Show Done</Button>
                </ButtonToolbar>
                <TaskList>
                    {markedTasks.map(function (task) {
                        return <Task data={task}
                            onTitleClick={that.gotoTaskInProject.bind(that, task)}
                            key={'marked:' + task._id}/>
                    })}
                </TaskList>
                <h3> Due Task </h3>
                <TaskList>
                    {dueTasks.map(function (task) {
                        return <Task data={task}
                            onTitleClick={that.gotoTaskInProject.bind(that, task)}
                            key={'due:' + task._id}/>
                    })}
                </TaskList>
            </div>
        );
    },

    componentDidMount: function () {
        this.loadMarkedTasks();
        this.loadDueTasks();
    },

    loadMarkedTasks: function () {
        var that = this;
        //load marked task
        var params = {
            marked: true
        };
        if (!this.state.showDone) {
            params.status = 'doing';
        }
        DataAPI.Task.load(params).then(function (markedTasks) {
            that.setState({
                markedTasks: markedTasks
            });
        });
    },

    loadDueTasks: function () {
        var that = this;
        DataAPI.Task.load({
            dueDays: 3,
            populdate: false
        }).then(function (dueTasks) {
            that.setState({
                dueTasks: dueTasks
            });
        });
    },

    gotoTaskInProject: function (task) {
        var url = Util.getUrlFromTask(task);
        if (url) {
            this.transitionTo(url);
        }
    },

    showDone: function () {
        this.setState({
            showDone: !this.state.showDone
        }, function () {
            this.loadMarkedTasks();
        });
    }
});


module.exports = ProjectIndex;