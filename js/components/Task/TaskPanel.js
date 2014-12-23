/**
 * @jsx React.DOM
 */
var React = require('react');
var Router = require('react-router');
var TaskList = require('./TaskList');
var Task = require('./Task');
var Notify = require('../Notify');

var TODO = 'todo', DOING = 'doing', COMPLETE = 'complete';
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
                <TaskList className={sortClass} name="todo">
                {todoTasks.map(function (task) {
                    return <Task ref={task._id} data={task} key={task._id} selected={task._id === selectedTask}/>
                })}
                </TaskList>
                <TaskList className={sortClass} name="doing">
                {doingTasks.map(function (task) {
                    return <Task ref={task._id} data={task} key={task._id} selected={task._id === selectedTask} progress={true}/>
                })}
                </TaskList>
                <TaskList className={sortClass} name="complete">
                {completedTasks.map(function (task) {
                    return <Task ref={task._id} data={task} key={task._id} selected={task._id === selectedTask}/>
                })}
                </TaskList>
            </div>
        );
    },

    componentDidMount: function () {
        this.initDnd();
    },

    initDnd: function () {
        var that = this;
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
            },
            receive: function (event, ui) {
                var $receiveList = $(event.target),
                    listName = $receiveList.data('name');
                var $task = ui.item;
                var taskId = $task.data('id');
                var task = that.refs[taskId];
                var promise;
                if (task) {
                    if (listName === COMPLETE) {
                        promise = task.complete();
                    } else if (listName === TODO) {
                        promise = task.todo();
                    } else if (listName === DOING) {
                        promise = task.start();
                    }
                    promise.then(function (result) {
                        Notify.success('Task ' + result.name + 'complete!');
                    }, function (err) {
                        console.error('update progress failed');
                        $(ui.sender).sortable('cancel');
                        Notify.error('move task failed');
                    });
                }
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