/**
 * @jsx React.DOM
 */

var React = require('react');
var Moment = require('moment');
var Router = require('react-router');
var PureRenderMixin = require('react/addons').addons.PureRenderMixin;

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
            markedTask: []
        };
    },


    render: function () {
        var markedTask = this.state.markedTask;
        var that = this;
        return (
            <div className="ltt_c-page-projectsNew-index">
                <h3>Marked Tasks</h3>
                <TaskList>
                    {markedTask.map(function (task) {
                        return <Task data={task}
                            onTitleClick={that.gotoTaskInProject.bind(that, task)}
                            key={task._id}/>
                    })}
                </TaskList>
            </div>
        );
    },

    componentDidMount: function () {
        this.loadData();
    },

    loadData: function () {
        var that = this;
        //load marked task
        DataAPI.Task.load({
            marked: true
        }).then(function (markedTask) {
            that.setState({
                markedTask: markedTask
            });
        });
    },

    gotoTaskInProject: function (task) {
        var url = Util.getUrlFromTask(task);
        if (url) {
            this.transitionTo(url);
        }
    },
});


module.exports = ProjectIndex;