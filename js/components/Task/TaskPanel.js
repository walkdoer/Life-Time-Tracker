/**
 * @jsx React.DOM
 */
var React = require('react');
var Router = require('react-router');
var TaskList = require('./TaskList');
var Task = require('./Task');
var TaskPanel = React.createClass({
    render: function () {
        var tasks = this.props.tasks,
            selectedTask = this.props.selectedTask;
        var todoTasks = [],
            doingTasks = [],
            completedTasks = [];

        tasks.forEach(function(task) {
            var bucket,
                progress = task.progress;
            if (progress > 0 && progress < 100) {
                bucket = doingTasks;
            } else if (progress === 100) {
                bucket = completedTasks;
            } else {
                bucket = todoTasks;
            }
            bucket.push(task);
        });

        return (
            <div className="ltt_c-taskPanel">
                <TaskList>
                {todoTasks.map(function (task) {
                    return <Task data={task} key={task._id} selected={task._id === selectedTask}/>
                })}
                </TaskList>
                <TaskList>
                {doingTasks.map(function (task) {
                    return <Task data={task} key={task._id} selected={task._id === selectedTask} progress={true}/>
                })}
                </TaskList>
                <TaskList>
                {completedTasks.map(function (task) {
                    return <Task data={task} key={task._id} selected={task._id === selectedTask}/>
                })}
                </TaskList>
            </div>
        );
    }
});

module.exports = TaskPanel;