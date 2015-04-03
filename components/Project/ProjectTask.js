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
var PureRenderMixin = require('react/addons').addons.PureRenderMixin;

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
var TaskDetail = require('../Task/TaskDetail');

/** components/charts */
var TreeMap = require('../charts/TreeMap');


/** Utils */
var Util = require('../../utils/Util');

module.exports = React.createClass({

    mixins: [PureRenderMixin, Router.State, Router.Navigation],

    getInitialState: function () {
        return extend({
            projectLoaded: false,
            taskLoaded: false,
            openTreeMap: false,
            openTaskDetail: false,
            markedFilter: false,
            taskStatus: 'doing',
            tasks: []
        }, this.getStateFromParams());
    },

    getStateFromParams: function () {
        var params = this.getRequestParams();
        return params;
    },

    render: function () {
        console.log('render projectTask');
        var loadingMsg, taskList;
        var project = this.state.project;
        var version;
        var that = this;
        var taskId = this.state.taskId;
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
                        <div className="btn-group">
                            <button className={"btn btn-xs " + (this.state.markedFilter ? 'active' : '')}
                                onClick={that.onTaskMarkedFilter}><i className="fa fa-flag"></i></button>
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
                                onTaskChange={this.onTaskChange}
                                onClick={that.openTask}
                                selected={task._id === taskId}/>
                        })}
                    </TaskList>
                </main>
                {this.renderTaskDetail()}
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

    getRequestParams: function () {
        return _.extend({
            projectId: null,
            versionId: null,
            taskId: null
        }, this.getParams());
    },

    componentWillReceiveProps: function (nextProps) {
        var that = this;
        var params = this.getRequestParams();
        //no need to load again
        if (nextProps.projectId === this.props.projectId &&
            nextProps.versionId === this.props.versionId) {
            this.setState({
                taskId: params.taskId,
                versionId: params.versionId
            });
        } else {
            this.setState(_.extend({
                projectLoaded: false,
                openTaskDetail: false,
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

    renderTaskDetail: function () {
        console.log('render');
        if (this.state.openTaskDetail) {
            return <TaskDetail  {... _.pick(this.state, ['projectId', 'versionId'])}
                onHidden={this.onLogListHidden}
                onChange={this.onTaskChange}
                task={this.currentTask}/>
        }
    },

    onTaskChange: function (task) {
        var tasks = this.state.tasks;
        var taskId = task._id;
        var target;
        //locate the task in task tree
        Util.walkTree({children: tasks}, function (taskItem) {
            if (taskItem._id === taskId) {
                target = taskItem;
                return false;
            }
        });
        //if task located, then update it with changed value
        if (target) {
            console.info('update lop');
            _.extend(target, _.omit(task, 'children'));
            this.setState({
                tasks: tasks
            });
        }
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

    onTaskMarkedFilter: function () {
        var that = this;
        this.setState({
            markedFilter: !this.state.markedFilter
        }, function () {
            var markedFilter = this.state.markedFilter;
            var params = {
                status: this.state.taskStatus,
                marked: markedFilter
            };
            if (markedFilter) {
                params.parent = undefined;
            }
            this.loadTasks(params).then(function () {
                if (that.state.openTreeMap) {
                    that.plotTreeMap();
                }
            });
        })
    },

    onLogListHidden: function () {
        this.setState({
            openTaskDetail: false
        }, function () {
            this.plotTreeMap();
        });
    },


    loadTasks: function (params) {
        var deferred = Q.defer();
        var that = this;
        var defaultParams = _.pick(that.props, ['projectId', 'versionId']);
        defaultParams.parent = "null";
        params = _.extend({}, defaultParams, params);
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
        if (!this.refs.treeMap) {return;}
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
        console.log('open task');
        var useVersion = !!this.props.versionId;
        if (useVersion && task.versionId) {
            url = '/projects/' + task.projectId + '/versions/' + task.versionId + '/tasks/' + task._id;
        } else {
            url = '/projects/' + task.projectId + '/tasks/' + task._id;
        }
        this.currentTask = task;
        this.transitionTo(url);
        this.setState({
            openTaskDetail: true
        });
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
