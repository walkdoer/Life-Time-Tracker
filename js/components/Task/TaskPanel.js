/**
 * @jsx React.DOM
 */
var React = require('react');
var Router = require('react-router');
var TaskList = require('./TaskList');
var Task = require('./Task');

var PROGRESS_TYPE_MAP = {};
var TODO = 'todo', DOING = 'doing', COMPLETE = 'complete';
PROGRESS_TYPE_MAP[TODO] = -1;
PROGRESS_TYPE_MAP[DOING] = 0;
PROGRESS_TYPE_MAP[COMPLETE] = 100;

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
                var $receiveList = $(event.target);
                var $task = ui.item;
                var taskId = $task.data('id');
                var task = that.refs[taskId];
                if (task) {
                    var progress = getProgress(task, $receiveList.data('name'));
                    task.update({
                        progress: progress
                    });
                    console.log('update progress = ' + progress);
                }
            }
        }).disableSelection();

        function getProgress(task, listType) {
            var progress = PROGRESS_TYPE_MAP[listType];
            if (listType === DOING) {
                return task.get('progress');
            }
            return progress;
        }
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