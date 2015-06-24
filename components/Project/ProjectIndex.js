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
var DropdownButton = RB.DropdownButton;
var MenuItem = RB.MenuItem;
var _ = require('lodash');

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
            overDueTasks: [],
            showDone: false
        };
    },


    render: function () {
        var markedTasks = this.state.markedTasks;
        var dueTasks = this.state.dueTasks;
        var overDueTasks = this.state.overDueTasks;
        var that = this;
        return (
            <div className="ltt_c-page-projectsNew-index">
                <div className="due-list">
                    {!_.isEmpty(overDueTasks) ?
                    <div>
                        <div className="list-header">
                            <h3>Over Due</h3>
                        </div>
                        <TaskList>
                            {overDueTasks.map(function (task) {
                                return <Task data={task}
                                    dueTime={true}
                                    totalTime={false}
                                    onTitleClick={that.gotoTaskInProject.bind(that, task)}
                                    key={'due:' + task._id}/>
                            })}
                        </TaskList>
                    </div> : null }
                    {!_.isEmpty(dueTasks) ?
                    <div>
                        <div className="list-header">
                            <h3> Due Soon</h3>
                            <ButtonToolbar>
                                <DropdownButton bsSize='small' title='Due soon in' onSelect={this.loadDueSoonTasks}>
                                    <MenuItem eventKey='1'>tomorrow</MenuItem>
                                    <MenuItem eventKey='3'>3 days</MenuItem>
                                    <MenuItem eventKey='7'>7 days</MenuItem>
                                    <MenuItem eventKey='30'>30 days</MenuItem>
                                    <MenuItem eventKey='30'>60 days</MenuItem>
                                 </DropdownButton>
                            </ButtonToolbar>
                        </div>
                        <TaskList>
                            {dueTasks.map(function (task) {
                                return <Task data={task}
                                    dueTime={true}
                                    totalTime={false}
                                    onTitleClick={that.gotoTaskInProject.bind(that, task)}
                                    key={'due:' + task._id}/>
                            })}
                        </TaskList>
                    </div>
                    : null}
                </div>
                {!_.isEmpty(markedTasks) ?
                <div className="marked-list">
                    <div className="list-header">
                        <h3>Marked Tasks</h3>
                        <ButtonToolbar>
                            <Button bsSize='small' active={this.state.showDone} onClick={this.showDone}>Show Done</Button>
                        </ButtonToolbar>
                    </div>
                    <TaskList>
                        {markedTasks.map(function (task) {
                            return <Task data={task}
                                displayChildren={false}
                                totalTime={false}
                                onTitleClick={that.gotoTaskInProject.bind(that, task)}
                                key={'marked:' + task._id}/>
                        })}
                    </TaskList>
                </div>
                : null}
            </div>
        );
    },

    componentDidMount: function () {
        this.loadMarkedTasks();
        this.loadDueSoonTasks();
        this.loadOverDueTasks();
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

    loadDueSoonTasks: function (days) {
        var that = this;
        if (days) {
            days = parseInt(days, 10);
        }
        DataAPI.Task.load({
            status: 'doing',
            dueDays: days || 15, //default load task that will due in 15 days
            populate: false
        }).then(function (dueTasks) {
            that.setState({
                dueTasks: dueTasks
            });
        });
    },

    loadOverDueTasks: function () {
        DataAPI.Task.load({
            status: 'doing',
            populate: false,
            overDue: true
        }).then(function (tasks) {
            this.setState({
                overDueTasks: tasks
            });
        }.bind(this))
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