/**
 * @jsx React.DOM
 */
var React = require('react');
var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;
var Router = require('react-router');
var Moment = require('moment');
var Link = Router.Link;
var Q = require('q');
var _ = require('lodash');


/**components*/
var Progress = require('../Progress');
var TaskList = require('../Task/TaskList');


var Task = React.createClass({

    getInitialState: function () {
        return {
            isOpen: this.props.defaultIsOpen,
            selected: this.props.selected
        };
    },

    getDefaultProps: function () {
        return {
            defaultIsOpen: true,
            selected: false
        };
    },

    componentWillReceiveProps: function (newProps) {
        //if user close the task, then should not open again
        if (!this.isOpen) {
            return this.setState({
                selected: newProps.selected
            });
        }
        this.setState({
            isOpen: newProps.defaultIsOpen,
            selected: newProps.selected
        });
    },


    render: function () {
        var task = this.props.data;
        var taskId = this.props.taskId;
        var url;
        var that = this;
        var progress;
        if (this.props.progress >= 0) {
            progress = (<Progress max={100} value={task.progress}/>);
        }
        var subTasks = task.children,
            subTaskList = null,
            hasSubTasks = !_.isEmpty(subTasks);
        if (hasSubTasks && this.state.isOpen) {
            subTaskList = (
                <TaskList className="subtask">
                    {subTasks.map(function (task) {
                        return (<Task data={task} key={task.id} onClick={that.props.onClick} selected={task._id === taskId}/>);
                    })}
                </TaskList>
            );
        }
        var openButton;
        if (hasSubTasks) {
            openButton = <div className="ltt_c-task-openButton" onClick={this.toggle}>
                {<i className={'ltt_c-task-openButton-icon fa ' + (this.state.isOpen ? 'fa-chevron-down' : 'fa-chevron-right')}></i>}
            </div>
        }

        return (
            <li className="ltt_c-task" data-id={task._id}>
                <div className={"ltt_c-task-title" + (this.state.selected ? ' selected' : '')} onClick={this.select}>
                    {openButton}
                    <span>{task.name}</span>
                    {progress}
                     <div className="ltt_c-task-timeInfo">
                    <span title={new Moment(task.createTime).format('YYYY-MM-DD HH:mm:ss')}>
                        <i className="fa fa-plus" title="create time"></i>
                        {new Moment(task.createTime).fromNow()}
                    </span>
                    <span>
                        <i className="fa fa-clock-o" title="total time"></i>
                        {Moment.duration(task.totalTime, "minutes").format("M[m],d[d],h[h],mm[min]")}
                    </span>
                    <span title={new Moment(task.lastActiveTime).format('YYYY-MM-DD HH:mm:ss')}>
                        <i className="fa fa-user" title="last active"></i>
                        {new Moment(task.lastActiveTime).fromNow()}
                    </span>
                </div>
                </div>
                {subTaskList}
            </li>
        );
    },

    select: function (e) {
        var className = e.target.className;
        if (className.indexOf('ltt_c-task-openButton') >= 0
            || className.indexOf('ltt_c-task-openButton-icon') >= 0) {
            e.stopPropagation();
            return false;
        }
        this.setState({
            selected: true
        }, function () {
            this.props.onClick(e, this.props.data);
        });
    },

    toggle: function () {
        this.setState({
            isOpen: !this.state.isOpen
        });
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