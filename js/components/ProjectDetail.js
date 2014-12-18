/**
 * @jsx React.DOM
 */

var React = require('react');
var remoteStorage = require('./storage.remote');
var Moment = require('moment');
var Router = require('react-router');
var Tag = require('./Tag');
var _ = require('lodash');
var LogClass = require('./LogClass');
var TIME_FORMAT = 'YYYY-MM-DD HH:mm';
var LoadIndicator = require('./LoadIndicator');
var Log = require('./Log');
var DropdownButton = require('react-bootstrap').DropdownButton;

var ProjectDetail = React.createClass({
    mixins: [Router.State],
    getInitialState: function () {
        return {
            loading: true,
            loadingTask: true,
            loadingLog: true,
            project: null,
            tasks: [],
            logs: []
        };
    },

    render: function () {
        var loadingMsg, projectBasicInfo, taskList, logList;
        var project = this.state.project;
        if (this.state.loading) {
            loadingMsg = (<div className="text-center"><i className="fa fa-spinner fa-spin"></i> Loading project</div>);
        }
        if (project) {
            var tags = project.tags,
                logClasses = project.classes;
            if (!_.isEmpty(tags)) {
                tags = tags.map(function (tag) {
                    return (<Tag>{tag}</Tag>);
                });
            }
            if (!_.isEmpty(logClasses)) {
                logClasses = logClasses.map(function(cls) {
                    return (<LogClass data={cls}/>);
                });
            }
            var versions;
            if (!_.isEmpty(project.versions)) {
                versions = (<select>
                    {project.versions.map(function (ver) {
                        return (<option value={ver.name}>{ver.name}</option>);
                    })}
                </select>);
            }
            projectBasicInfo = (
                <section className="ltt_c-projectDetail-basicInfo">
                    <h1>{project.name}</h1>
                    <p className="ltt_c-projectDetail-tags">{tags}</p>
                    <p className="ltt_c-projectDetail-times">
                        <span className="ltt-M2">create: {new Moment(project.createdTime).format(TIME_FORMAT)}</span>
                        <span className="ltt-M2"><i className="fa fa-child" title="last active"></i> {new Moment(project.lastActiveTime).fromNow()}</span>
                    </p>
                    <p className="ltt_c-projectDetail-logClasses">{logClasses}</p>
                    {versions}
                </section>
            );

            var tasks = this.state.tasks,
                logs = this.state.logs,
                noTask = (<p>No Task.</p>),
                noLog = (<p>No Log.</p>),
                taskLoading,
                logLoading;
            if (this.state.loadingTask) {
                taskLoading = (<LoadIndicator/>);
            }
            taskList = (
                <TaskList>
                    {taskLoading}
                    {!_.isEmpty(tasks) ? tasks.map(function(task) {
                        return <Task data={task} key={task._id} onClick={this.onTaskClick}/>
                    }, this) : noTask}
                </TaskList>
            );

            if (this.state.loadingLogs) {
                logLoading = (<LoadIndicator/>);
            }
            var logContent = _.isEmpty(logs) ? noLog : logs.map(function (log) {
                return (<Log {... log}/>);
            });
            logList = (
                <div className="ltt_c-projectDetail-logs">
                    {logLoading}
                    {logContent}
                </div>
            );
        }
        return (
            <div className="ltt_c-projectDetail">
                {loadingMsg}
                {projectBasicInfo}
                <div className="ltt-flex">
                    {taskList}
                    {logList}
                </div>
            </div>
        );
    },

    componentDidMount: function () {
        var projectId = this.getParams().projectId;
        var that = this;
        var loadProject = function (id) {
            return remoteStorage.get('/api/projects/' + projectId);
        }, loadTasks = function (project) {
            return remoteStorage.get('/api/tasks', {projectId: project._id});
        };
        loadProject(projectId)
            .then(function (res) {
                var project = res.data;
                that.setState({
                    loading: false,
                    project: project
                });
                loadTasks(project)
                    .then(function (res) {
                        that.setState({
                            loadingTask: false,
                            tasks: res.data
                        });
                    })
                that.loadLogs(project)
                    .then(function (res) {
                        that.setState({
                            loadingLog: false,
                            logs: res.data
                        });
                    })
            })
            .catch(function (err) {
                throw err;
            });
    },

    loadLogs: function (project) {
        return remoteStorage.get('/api/logs', {projectId: project._id});
    },

    onTaskClick: function () {
        console.log(arguments);
    }

});



var TaskList = React.createClass({
    render: function () {
        return (
            <ul className="ltt_c-taskList">
                {this.props.children}
            </ul>
        );
    }
});

var Task = React.createClass({
    render: function () {
        var task = this.props.data;
        return (
            <li className="ltt_c-task">
                <span className="ltt_c-task-tag"><i className="fa fa-ellipsis-v"></i></span>
                <span>{task.name}</span>
            </li>
        );
    }
});

module.exports = ProjectDetail;
