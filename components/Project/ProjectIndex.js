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
                                onTitleClick={that.gotoTaskInProject.bind(that, task)}
                                key={'marked:' + task._id}/>
                        })}
                    </TaskList>
                </div>
                <div className="due-list">
                    <div className="list-header">
                        <h3> Due Task </h3>
                        <ButtonToolbar>
                            <DropdownButton bsSize='small' title='Due in' onSelect={this.loadDueTasks}>
                                <MenuItem eventKey='1'>1 days</MenuItem>
                                <MenuItem eventKey='3'>3 days</MenuItem>
                                <MenuItem eventKey='7'>7 days</MenuItem>
                                <MenuItem eventKey='30'>30 days</MenuItem>
                             </DropdownButton>
                        </ButtonToolbar>
                    </div>
                    <TaskList>
                        {dueTasks.map(function (task) {
                            return <Task data={task}
                                dueTime={true}
                                onTitleClick={that.gotoTaskInProject.bind(that, task)}
                                key={'due:' + task._id}/>
                        })}
                    </TaskList>
                </div>
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

    loadDueTasks: function (days) {
        var that = this;
        if (days) {
            days = parseInt(days, 10);
        }
        DataAPI.Task.load({
            dueDays: days || 3,
            populate: false
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