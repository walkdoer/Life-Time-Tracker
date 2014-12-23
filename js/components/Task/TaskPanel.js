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

        var sortClass = "ltt__sortable";

        return (
            <div className="ltt_c-taskPanel">
                <TaskList className={sortClass}>
                {todoTasks.map(function (task) {
                    return <Task data={task} key={task._id} selected={task._id === selectedTask}/>
                })}
                </TaskList>
                <TaskList className={sortClass}>
                {doingTasks.map(function (task) {
                    return <Task data={task} key={task._id} selected={task._id === selectedTask} progress={true}/>
                })}
                </TaskList>
                <TaskList className={sortClass}>
                {completedTasks.map(function (task) {
                    return <Task data={task} key={task._id} selected={task._id === selectedTask}/>
                })}
                </TaskList>
            </div>
        );
    },

    componentDidMount: function () {
        this.initDnd();
    },

    initDnd: function () {
        var $column = $(this.getDOMNode()).find('.ltt__sortable');
        $column.sortable({
            connectWith: ".ltt__sortable",
            placeholder: "item-highlight",
            start: function (event, ui) {
                ui.item.addClass('tilt');
                tilt_direction(ui.item);
            },
            stop: function (event, ui) {
                ui.item.removeClass("tilt");
                $("html").unbind('mousemove', ui.item.data("move_handler"));
                ui.item.removeData("move_handler");
            }
        }).disableSelection();
    }
});


function tilt_direction(item) {
    var left_pos = item.position().left,
        move_handler = function (e) {
            if (e.pageX >= left_pos) {
                item.addClass("right");
                item.removeClass("left");
            } else {
                item.addClass("left");
                item.removeClass("right");
            }
            left_pos = e.pageX;
        };
    $("html").bind("mousemove", move_handler);
    item.data("move_handler", move_handler);
}


module.exports = TaskPanel;