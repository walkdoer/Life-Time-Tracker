/**
 * @jsx React.DOM
 */

var React = require('react');
var Moment = require('moment');
var Router = require('react-router');
var Link = Router.Link;
var _ = require('lodash');

var extend = require('extend');

/** mixins */
var initParams = require('./mixins/initParams');

/** const */
var TIME_FORMAT = 'YYYY-MM-DD HH:mm';

/** components */
var Tag = require('./Tag');
var Log = require('./Log');
var LoadIndicator = require('./LoadIndicator');
var DropdownButton = require('react-bootstrap').DropdownButton;
var LogClass = require('./LogClass');
var remoteStorage = require('./storage.remote');
var TaskPanel = require('./Task/TaskPanel');


var ProjectDetail = React.createClass({
    mixins: [initParams],

    getInitialState: function () {
        return extend({
            loading: true,
            loadingTask: true,
            loadingLog: true,
            project: null,
            tasks: [],
            logs: []
        }, this.getStateFromParams());
    },

    getStateFromParams: function () {
        return {
            selectedTask: this.params.taskId
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

            var logs = this.state.logs,
                noLog = (<p>No Log.</p>),
                logLoading;
            if (this.state.loadingTask) {
                taskLoading = (<LoadIndicator/>);
            }

            var taskPanel = <TaskPanel tasks={this.state.tasks} selectedTask={this.state.selectedTask}/>

            if (this.state.loadingLog) {
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
                {taskPanel}
                {logList}
            </div>
        );
    },
    componentWillReceiveProps: function (nextProps) {
        this.setState(extend({
            loadingLog: true
        }, this.getStateFromParams()));
        this.loadLogs(_.pick(this.params, ['projectId', 'taskId']));
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
                that.loadLogs(_.pick(that.getParams(), ['projectId', 'taskId']));
            })
            .catch(function (err) {
                console.error(err.stack);
                throw err;
            });
    },

    loadLogs: function (params) {
        var that = this;
        var promise = remoteStorage.get('/api/logs', params)
            .then(function (res) {
                that.setState({
                    loadingLog: false,
                    logs: res.data
                });
            });
        return promise;
    }

});

module.exports = ProjectDetail;
