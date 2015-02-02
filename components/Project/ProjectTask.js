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
        console.log('render Project tasks');
        var loadingMsg, projectBasicInfo, taskList;
        var project = this.state.project;
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
        return (
            <div className="ltt_c-projectTask">
                <main>
                    <div className="ltt_c-projectDetail">{projectBasicInfo}</div>
                    <TaskList>
                        {this.state.tasks.map(function (task) {
                            return <Task ref={task._id}
                                useVersion={!!currentVersionId}
                                data={task}
                                key={task._id}
                                taskId={taskId}
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
                that.loadTasks(_.pick(that.props, ['projectId', 'versionId']));
            })
            .catch(function (err) {
                console.error(err.stack);
                throw err;
            });
    },


    loadTasks: function (params) {
        var that = this;
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
    }
});
