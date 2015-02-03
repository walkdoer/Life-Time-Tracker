/**
 * @jsx React.DOM
 */

var React = require('react');
var Moment = require('moment');
var Router = require('react-router');
var RouteHandler = Router.RouteHandler;
var Link = Router.Link;
var _ = require('lodash');

var extend = require('extend');

/** mixins */
var initParams = require('../mixins/initParams');

/** const */
var TIME_FORMAT = 'YYYY-MM-DD HH:mm';

/** components */
var Tag = require('../Tag');
var Log = require('../Log');
var LoadIndicator = require('../LoadIndicator');
var LogClass = require('../LogClass');
var remoteStorage = require('../storage.remote');
var LoadingMask = require('../LoadingMask');
var TaskList = require('../Task/TaskList');
var Task = require('../Task/Task');

module.exports = React.createClass({
    mixins: [Router.State, Router.Navigation],

    getInitialState: function () {
        return extend({
            projectLoaded: false,
            taskLoaded: false,
            taskStatus: 'doing',
            tasks: []
        }, this.getStateFromParams());
    },

    getStateFromParams: function () {
        var params = this.getParams();
        return {
            taskId: params.taskId || null
        };
    },

    render: function () {
        var loadingMsg, projectBasicInfo, taskList;
        var project = this.state.project;
        var that = this;
        var taskId = this.state.taskId;
        var currentVersionId = this.props.versionId;
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
            var versions, lastVersion;
            if (false && !_.isEmpty(project.versions)) {
                if (!currentVersionId) {
                    currentVersionId = 'all_versions';
                }
                versions = (<select onChange={this.onVersionChange} value={currentVersionId}>
                        <option value="all_versions">All Versions</option>
                    {project.versions.map(function (ver) {
                        return (<option value={ver._id}>{ver.name}</option>);
                    })}
                </select>);
            }
            var mProjectCreateTime = new Moment(project.createdTime);
            projectBasicInfo = (
                <section className="ltt_c-projectDetail-basicInfo">
                    <h1>{project.name}<span className="ltt_c-projectDetail-logClasses">{logClasses}</span></h1>
                    <p className="ltt_c-projectDetail-tags">{tags}</p>
                    <p className="ltt_c-projectDetail-times">
                        <span className="ltt-M2" title={mProjectCreateTime.format(TIME_FORMAT)}>Create: {mProjectCreateTime.fromNow()}</span>
                        <span className="ltt-M2"><i className="fa fa-child" title="last active"></i> {new Moment(project.lastActiveTime).fromNow()}</span>
                    </p>
                    {versions}
                </section>
            );
        }
        var logs;
        if (taskId) {
            logs = <aside className="ltt_c-projectTask-logs">
                    <RouteHandler {... _.pick(this.state, ['projectId', 'taskId', 'versionId'])}/>
            </aside>
        }
        var taskStatus = this.state.taskStatus;
        return (
            <div className="ltt_c-projectTask">
                <main>
                    <div className="ltt_c-projectDetail">{projectBasicInfo}</div>
                    <div className="ltt_c-projectTask-toolbar">
                        <div className="btn-group">
                        {[
                            {label: 'All', status: 'all'},
                            {label: 'Doing', status: 'doing'},
                            {label: 'Done', status: 'done'}
                        ].map(function (btn) {
                            var className = "btn btn-xs";
                            if (btn.status === taskStatus) {
                                className += ' active';
                            }
                            return <button className={className}
                                onClick={that.onTaskStatusChange.bind(that, btn.status)}>{btn.label}</button>;
                        })}
                        </div>
                    </div>
                    <TaskList>
                        {this.state.tasks.map(function (task) {
                            return <Task ref={task._id}
                                data={task}
                                key={task._id}
                                taskId={taskId}
                                onClick={that.openTask}
                                selected={task._id === taskId}/>
                        })}
                        <LoadingMask loaded={this.state.taskLoaded}/>
                    </TaskList>
                </main>
                {logs}
                <LoadingMask loaded={this.state.projectLoaded}/>
            </div>
        );
    },

    componentDidMount: function () {
        this.loadProject(this.props.projectId);
    },

    /*shouldComponentUpdate: function (nextProps, nextState) {
        return nextProps.projectId !== this.props.projectId ||
            nextProps.versionId !== this.props.versionId;
    },*/

    componentWillReceiveProps: function (nextProps) {
        var that = this;
        var params = this.getParams();
        //no need to load again
        if (nextProps.projectId === this.props.projectId &&
            nextProps.versionId === this.props.versionId) {
            this.setState({
                taskId: params.taskId
            });
            return;
        }
        this.setState({
            projectLoaded: false,
            taskLoaded: false,
            taskId: params.taskId
        }, function () {
            this.loadProject(nextProps.projectId);
            this.loadTasks(_.pick(nextProps, ['projectId', 'versionId']));
        });
    },

    loadProject: function (projectId) {
        var that = this;
        remoteStorage.get('/api/projects/' + projectId)
            .then(function (res) {
                var project = res.data;
                that.setState({
                    projectLoaded: true,
                    project: project
                });
                that.loadTasks({
                    status: that.state.taskStatus
                });
            })
            .catch(function (err) {
                console.error(err.stack);
                throw err;
            });
    },

    onTaskStatusChange: function (status, e) {
        this.setState({
            taskStatus: status
        }, function () {
            this.loadTasks({
                status: this.state.taskStatus
            });
        });
    },


    loadTasks: function (params) {
        var that = this;
        var defaultParams = _.pick(that.props, ['projectId', 'versionId']);
        params = _.extend(defaultParams, params);
        params.calculateTimeConsume = true;
        return remoteStorage.get('/api/tasks', params)
                .then(function (res) {
                    that.setState({
                        taskLoaded: true,
                        tasks: res.data
                    });
                }).catch(function (err) {
                    console.error(err.stack);
                });
    },

    openTask: function (e, task) {
        var useVersion = !!this.props.versionId;
        if (useVersion && task.versionId) {
            url = '/projects/' + task.projectId + '/versions/' + task.versionId + '/tasks/' + task._id;
        } else {
            url = '/projects/' + task.projectId + '/tasks/' + task._id;
        }
        this.transitionTo(url);
    }
});
