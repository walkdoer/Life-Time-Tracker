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
var cx = React.addons.classSet;


/**components*/
var Progress = require('../Progress');
var TaskList = require('../Task/TaskList');
var DataAPI = require('../../utils/DataAPI');

/** Constant */
var EMPTY_FUN = function () {};

var Task = React.createClass({

    getInitialState: function () {
        return {
            isOpen: this.props.defaultIsOpen,
            selected: this.props.selected,
            marked: this.props.data.marked
        };
    },

    getDefaultProps: function () {
        return {
            defaultIsOpen: true,
            selected: false,
            onTaskChange: EMPTY_FUN
            //onUnMark: EMPTY_FUN
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
        var version = this.props.version;
        var url;
        var that = this;
        var progress;
        if (task.progress >= 0 ) {
            if (task.progress < 100) {
                progress = (<Progress max={100} value={task.progress}/>);
            } else {
                progress = (<span className="ltt_c-task-done"><i className="fa fa-check-circle"></i></span>)
            }
        }
        var subTasks = task.children,
            subTaskList = null,
            hasSubTasks = !_.isEmpty(subTasks);
        if (hasSubTasks && this.state.isOpen) {
            subTaskList = (
                <TaskList className="subtask">
                    {subTasks.map(function (task) {
                        return (<Task {... _.pick(that.props, ['onClick', 'onDoubleClick'])}data={task} key={task.id}
                            selected={task._id === taskId}/>);
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
        var link;
        if (task.attributes && (link = task.attributes.link)) {
            link = <span onClick={this.openTaskExternalLink.bind(this, link)} title={link}><i className="fa fa-external-link"></i></span>
        }

        return (
            <li className={cx({"ltt_c-task": true, "done": task.progress === 100})} data-id={task._id} onDoubleClick={this.props.onDoubleClick} onClick={this.select}>
                <div className={cx({"ltt_c-task-title": true, 'selected' : this.state.selected})}>
                    {openButton}
                    <span className="ltt_c-task-title-text" onClick={this.props.onTitleClick}>{task.name}</span>
                    {link}
                    <span className={"ltt_c-task-mark " + (this.state.marked ? 'marked': '')} onClick={this.toggleMark}>
                        <i className={this.state.marked ? 'fa fa-flag' : 'fa fa-flag-o'}></i>
                    </span>
                    <div className="ltt_c-task-basicInfo">
                        <div className="ltt_c-task-basicInfo-version">
                            {version ? <span><i className="fa fa fa-sitemap"></i>{version.name}</span> : null}
                        </div>
                        <div className="ltt_c-task-timeInfo">
                            <span className="ltt_c-task-timeInfo-item" title={new Moment(task.createTime).format('YYYY-MM-DD HH:mm:ss')}>
                                <i className="fa fa-plus" title="create time"></i>
                                {new Moment(task.createTime).fromNow()}
                            </span>
                            <span  className="ltt_c-task-timeInfo-item">
                                <i className="fa fa-clock-o" title="total time"></i>
                                {Moment.duration(task.totalTime, "minutes").format("M[m],d[d],h[h],mm[min]")}
                            </span>
                            <span  className="ltt_c-task-timeInfo-item" title={new Moment(task.lastActiveTime).format('YYYY-MM-DD HH:mm:ss')}>
                                <i className="fa fa-user" title="last active"></i>
                                {new Moment(task.lastActiveTime).fromNow()}
                            </span>
                        </div>
                    </div>
                    {progress}
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
            this.props.onClick(this.props.data, e);
        });
    },

    toggleMark: function (e) {
        e.stopPropagation();
        this.setState({
            marked: !this.state.marked
        }, function () {
            var that = this;
            DataAPI.Task.update({id: this.props.data._id, marked: this.state.marked}).then(function (task) {
                that.props.onTaskChange(task);
            });
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
    },

    openTaskExternalLink: function (link) {
        console.log('openExternalLink', link);
        Ltt.openExternalLink(link);
    }
});

module.exports = Task;