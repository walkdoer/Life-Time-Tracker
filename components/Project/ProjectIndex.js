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

    getInitialState: function () {
        return {
            markedTask: []
        };
    },


    render: function () {
        var markedTask = this.state.markedTask;
        return (
            <div className="ltt_c-page-projectsNew-index">
                <h3>Marked Tasks</h3>
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