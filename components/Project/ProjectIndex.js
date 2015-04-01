/**
 * @jsx React.DOM
 */

var React = require('react');
var Moment = require('moment');


/** Components */
var Task = require('../Task/Task.js');
var TaskList = require('../Task/TaskList');

/** utils */
var DataAPI = require('../../utils/DataAPI');

var ProjectIndex = React.createClass({
    render: function () {
        var markedTask = this.state.markedTask;
        return (
            <div>
                <h1>Marked Tasks</h1>
                <TaskList>
                    {markedTask.map(function (task) {
                        return <Task data={task}
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
    }
});


module.exports = ProjectIndex;