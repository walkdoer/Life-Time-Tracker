/**
 * @jsx React.DOM
 */

var React = require('react');
var Moment = require('moment');
var Router = require('react-router');
var RouteHandler = Router.RouteHandler;
var Link = Router.Link;
var Q = require('q');
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
var LogList = require('../LogList');

/** components/charts */
var TreeMap = require('../charts/TreeMap');

module.exports = React.createClass({
    mixins: [Router.State, Router.Navigation],

    getInitialState: function () {
        return extend({
            projectLoaded: false,
            taskLoaded: false,
            openTreeMap: false,
            taskStatus: 'doing',
            tasks: []
        }, this.getStateFromParams());
    },

    getStateFromParams: function () {
        var params = this.getParams();
        return params;
    },

    render: function () {
        var loadingMsg, taskList;
        var project = this.state.project;
        var version;
        var that = this;
        var taskId = this.state.taskId;
        var logs;
        if ((taskId || this.state.taskLoaded && _.isEmpty(this.state.tasks))
            && !this.state.closeLogList) {
            if (!taskId) {
                RouteHandler = LogList;
            }
            logs = <RouteHandler {... _.pick(this.state, ['projectId', 'taskId', 'versionId'])}
                onHidden={this.onLogListHidden}
                isHidden={false}/>
        }
        var taskStatus = this.state.taskStatus;
        var currentVersionId = this.props.versionId;
        if (project) {
            version = project.versions.filter(function (version) {
                return version._id === currentVersionId;
            })[0];
        }
        return (
            <div className="ltt_c-projectTask">
                <main>
                    <div className="ltt_c-projectDetail">
                        <ProjectInfo ref="projectInfo" project={project} versionId={currentVersionId}/>
                    </div>
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
                        <div className="btn-group" style={{float: 'right'}}>
                            <button className="btn btn-xs" onClick={this.openTreeMap}>TreeMap</button>
                        </div>
                    </div>
                    {this.state.openTreeMap ? <TreeMap ref="treeMap"
                        title={"Time TreeMap of " + project.name + (version ? '-' + version.name : '')}/> : null }
                    <TaskList>
                        {this.state.tasks.map(function (task) {
                            return <Task ref={task._id}
                                data={task}
                                key={task._id}
                                taskId={taskId}
                                onClick={that.openTask}
                                selected={task._id === taskId}/>
                        })}
                    </TaskList>
                </main>
                {logs}
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
        } else {
            this.setState(_.extend({
                projectLoaded: false,
                taskLoaded: false
            }, params), function () {
                this.loadProject(nextProps.projectId);
                //this.loadTasks(_.pick(nextProps, ['projectId', 'versionId']));
            });
        }
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
                }).then(function () {
                    that.plotTreeMap();
                });
            })
            .catch(function (err) {
                console.error(err.stack);
                throw err;
            });
    },


    onTaskStatusChange: function (status, e) {
        var that = this;
        this.setState({
            taskStatus: status
        }, function () {
            this.loadTasks({
                status: this.state.taskStatus
            }).then(function () {
                if (that.state.openTreeMap) {
                    that.plotTreeMap();
                }
            });
        });
    },

    onLogListHidden: function () {
        this.plotTreeMap();
    },


    loadTasks: function (params) {
        var deferred = Q.defer();
        var that = this;
        var defaultParams = _.pick(that.props, ['projectId', 'versionId']);
        params = _.extend(defaultParams, params);
        params.calculateTimeConsume = true;
        remoteStorage.get('/api/tasks', params)
            .then(function (res) {
                that.setState({
                    taskLoaded: true,
                    tasks: res.data
                }, function () {
                    deferred.resolve(res.data);
                });
            }).catch(function (err) {
                deferred.reject(err);
            });
        return deferred.promise;
    },

    plotTreeMap: function () {
        var root = {
            name: this.state.project.name,
            children: []
        };
        var parentTask = {
            children: this.state.tasks
        };
        var children = root.children;
        var queue = [].concat(this.state.tasks);
        var task, currentNode = root;
        while (queue.length) {
            children = currentNode.children;
            task = queue.pop();
            if (children.length === parentTask.children.length) {
                children = parentNode.children;
                currentNode = parentNode;
            }
            newNode = {
                name: task.name,
                value: task.totalTime
            };
            children.push(newNode);
            if (!_.isEmpty(task.children)) {
                queue = queue.concat(task.children);
                newNode.children = [];
                parentTask = task;
                parentNode = currentNode;
                currentNode = newNode;
            }
        }
        this.refs.treeMap.plot(root);
    },

    openTreeMap: function () {
        this.setState({
            openTreeMap: !this.state.openTreeMap
        }, function () {
            if (this.state.openTreeMap) {
                this.plotTreeMap();
            }
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


var ProjectInfo = React.createClass({
    getInitialState: function () {
        return {
            showProjectDetail: false
        };
    },

    toggleProjectDetail: function () {
        this.setState({
            showProjectDetail: !this.state.showProjectDetail
        });
    },

    render: function () {
        var projectBasicInfo;
        var project = this.props.project;
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
            var versions, versionInfo, lastVersion;
            if (!_.isEmpty(project.versions) && currentVersionId) {
                var version = project.versions.filter(function (version) {
                    return version._id === currentVersionId;
                })[0];
                if (version) {
                    versionInfo = <p className="ltt_p-projectDetail-versionInfo">
                        <span className="version-name"><i className="fa fa-sitemap">{version.name}</i></span>
                        <span title={new Moment(version.createTime).format('YYYY-MM-DD HH:mm:ss')}>
                            <i className="fa fa-plus" title="create time"></i>
                            {new Moment(version.createTime).fromNow()}
                        </span>
                        <span title={new Moment(version.lastActiveTime).format('YYYY-MM-DD HH:mm:ss')}>
                            <i className="fa fa-user" title="last active"></i>
                            {new Moment(version.lastActiveTime).fromNow()}
                        </span>
                    </p>
                }
            }
            var mProjectCreateTime = new Moment(project.createdTime);
            var mProjectLastActiveTime = new Moment(project.lastActiveTime);
            projectBasicInfo = (
                <section className="ltt_c-projectDetail-basicInfo">
                    <h1>{project.name}
                        <span className="ltt_c-projectDetail-logClasses">{logClasses}</span>
                        <span className="ltt_c-projectDetail-times">
                            <span className="ltt-M2" title={mProjectCreateTime.format(TIME_FORMAT)}>
                                <i className="fa fa-plus" title="create time"></i>{mProjectCreateTime.fromNow()}
                            </span>
                            <span className="ltt-M2" title={mProjectLastActiveTime.format(TIME_FORMAT)}>
                                <i className="fa fa-child" title="last active"></i>{mProjectLastActiveTime.fromNow()}
                            </span>
                        </span>
                    </h1>
                    <span className="openDetail" onClick={this.toggleProjectDetail}>
                        <i className={this.state.showProjectDetail ? "fa fa-chevron-circle-down" : "fa fa-chevron-circle-right"}></i>
                    </span>
                    {this.state.showProjectDetail ? <div className="ltt_c-projectDetail-basicInfo-detail">
                        <p className="ltt_c-projectDetail-tags">{tags}</p>
                    </div> : null}
                    {versionInfo}
                </section>
            );
        } else {
            projectBasicInfo = <div></div>
        }
        return projectBasicInfo;
    }
})
