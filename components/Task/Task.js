/**
 * @jsx React.DOM
 */
var React = require('react');
var Router = require('react-router');
var Link = Router.Link;
var Q = require('q');
var _ = require('lodash');

/**components*/
var Progress = require('../Progress');
var TaskList = require('../Task/TaskList');


var Task = React.createClass({
    render: function () {
        var task = this.props.data;
        var url = '/projects/' + task.projectId + '/tasks/' + task._id;
        var className = "ltt_c-task";
        var progress;
        if (this.props.selected) {
            className += ' selected';
        }
        if (this.props.progress >= 0) {
            progress = (<Progress max={100} value={task.progress}/>);
        }
        var subTasks = task.subTasks,
            subTaskList = null;
        if (!_.isEmpty(subTasks)) {
            subTaskList = (
                <TaskList>
                    {subTasks.map(function (task) {
                        return (<Task data={task} key={task.id}/>);
                    })}
                </TaskList>
            );
        }
        return (
            <li className={className} data-id={task._id}>
                <div className="ltt_c-task-title">
                    <span className="ltt_c-task-tag"><i className="fa fa-ellipsis-v"></i></span>
                    <Link to={url}><span>{task.name}</span></Link>
                    {progress}
                </div>
                {subTaskList}
            </li>
        );
    },

    get: function (attrName) {
        return this.props[attrName];
    },

    update: function (data) {
        var deferred = Q.defer();
        var taskId = this.props.data._id;
        console.log('update task ' + taskId);
        $.ajax({
            type: "POST",
            url: '/api/tasks/' + taskId,
            data: data,
            success: function (result) {
                deferred.resolve(result);
            },
            error: function (err) {
                console.error(err);
                deferred.reject(err);
            },
            dataType: 'json'
        });
        return deferred.promise;
    },

    complete: function () {
        return this.update({progress: 100});
    },

    todo: function () {
        return this.update({progress: -1});
    },

    start: function () {
        return this.update({progress: 0});
    }
});

module.exports = Task;