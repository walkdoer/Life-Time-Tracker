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
var Mt = window.Mousetrap;
var RB = require('react-bootstrap');
var ButtonToolbar = RB.ButtonToolbar;
var Button = RB.Button;
var ButtonGroup = RB.ButtonGroup;
var Well = RB.Well;
var extend = require('extend');
var swal = require('sweetalert');
var mui = require('material-ui');
var ThemeManager = new mui.Styles.ThemeManager();
var IScroll = require('../../libs/iscroll');


/** mixins */
var initParams = require('../mixins/initParams');

/** Constatns */
var TIME_FORMAT = 'YYYY-MM-DD HH:mm';
var EventConstant = require('../../constants/EventConstant');
var MOUSEWHEEL = 'mousewheel';

/** components */
var Tag = require('../Tag');
var Log = require('../Log');
var LoadIndicator = require('../LoadIndicator');
var LogClass = require('../LogClass');
var LoadingMask = require('../LoadingMask');
var TaskList = require('../Task/TaskList');
var Task = require('../Task/Task');
var LogList = require('../LogList');
var TaskDetail = require('../Task/TaskDetail');
var Notify = require('../Notify');
var SlidePanel = require('../SlidePanel');
var EasyPie = require('../charts/EasyPie');
/** components/charts */
var TreeMap = require('../charts/TreeMap');
var Bar = require('../charts/Bar');

/** Utils */
var Util = require('../../utils/Util');
var DataAPI = require('../../utils/DataAPI');
var Bus = require('../../utils/Bus');



module.exports = React.createClass({

    childContextTypes: {
        muiTheme: React.PropTypes.object
    },

    mixins: [PureRenderMixin, Router.State, Router.Navigation],

    getInitialState: function () {
        return extend({
            projectLoaded: false,
            taskLoaded: false,
            openTreeMap: false,
            openTaskDetail: false,
            openStastics: false,
            markedFilter: false,
            taskStatus: 'doing',
            project: null,
            period: 'month',
            todayTaskTime: [],
            tasks: []
        }, this.getStateFromParams());
    },

    getChildContext: function() {
        return {
            muiTheme: ThemeManager.getCurrentTheme()
        };
    },


    getStateFromParams: function () {
        var params = this.getRequestParams();
        return params;
    },

    render: function () {
        var loadingMsg, taskList;
        var project = this.state.project;
        var version;
        var versionDetail = this.state.version;
        var that = this;
        var taskId = this.state.taskId;
        var taskStatus = this.state.taskStatus;
        var todayTaskTime = this.state.todayTaskTime;
        var period = this.state.period;
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
                        <ProjectInfo ref="projectInfo"
                            project={project}
                            versionId={currentVersionId}
                            onDeleteVersion={this.deleteVersion}
                            onFilterTags={this.filterTaskWithTags}/>
                    </div>
                    <div className="ltt_c-projectTask-toolbar">
                        <div className="btn-group">
                            {[
                                {label: 'All', status: 'all'},
                                {label: 'Doing', status: 'doing'},
                                {label: 'Done', status: 'done'}
                            ].map(function (btn) {
                                var className = "btn btn-xs btn-default";
                                if (btn.status === taskStatus) {
                                    className += ' active';
                                }
                                return <button className={className}
                                    onClick={that.onTaskStatusChange.bind(that, btn.status)}>{btn.label}</button>;
                            })}
                        </div>
                        <div className="btn-group">
                            {[
                                {label: 'Yesterday', value: 'yesterday'},
                                {label: 'Today', value: 'today'},
                                {label: 'Week', value: 'week'},
                                {label: 'Month', value: 'month'},
                                {label: 'Year', value: 'year'},
                                {label: 'All', value: 'all'},
                            ].map(function (btn) {
                                var className = "btn btn-xs btn-default";
                                if (btn.value === period) {
                                    className += ' active';
                                }
                                return <button className={className}
                                    onClick={that.onPeriodChange.bind(that, btn.value)}>{btn.label}</button>;
                            })}
                        </div>
                        <div className="btn-group">
                            <button className={"btn btn-xs btn-default " + (this.state.markedFilter ? 'active' : '')}
                                onClick={that.onTaskMarkedFilter}><i className="fa fa-flag"></i></button>
                        </div>
                        <ButtonToolbar style={{float: 'right'}}>
                            <ButtonGroup>
                                <Button bsSize='xsmall' onClick={this.openStastics}>statistic</Button>
                                <Button bsSize='xsmall' onClick={this.openTreeMap}>TreeMap</Button>
                            </ButtonGroup>
                        </ButtonToolbar>
                    </div>
                    {this.state.openTreeMap ? <TreeMap ref="treeMap"
                        title={"Time TreeMap of " + project.name + (version ? '-' + version.name : '')}/> : null }
                    <SlidePanel key={this.props.projectId}
                        ref="statistics" open={false} openRight={true} onTransitionEnd={this.renderStatistics}
                        position="fixed" zIndex={888}>
                        <h3>Statistis of {project ? project.name : null}</h3>
                        <div className="closeBtn" onClick={this.closeStastics}><i className="fa fa-close"/></div>
                        <div ref="statisticsContainer"></div>
                    </SlidePanel>
                    <div className="ltt_c-projectTask-moreInfo">
                        <span>Count: {this.state.tasks.length}</span>
                    </div>
                    <div className="ltt_c-projectTask-wrapper" ref="iscrollWrapper">
                        <div className="ltt_c-projectTask-wrapper-scroller">
                    {this.state.tasks.length > 0 ?
                        <TaskList select={taskId}>
                        {this.state.tasks.map(function (task) {
                            var childTaskId = task._id;
                            var todayTask = todayTaskTime.filter(function (t) { return t._id === childTaskId;})[0];
                            return <Task ref={childTaskId}
                                data={task}
                                key={childTaskId}
                                taskId={childTaskId}
                                defaultIsOpen={taskStatus === "doing" && ["year", "all"].indexOf(period) < 0}
                                todayTime={todayTask}
                                version={versionDetail}
                                onTaskChange={this.onTaskChange}
                                onClick={that.openTask}
                                selected={taskId === childTaskId}
                                project={project}/>
                        })}
                        </TaskList> : <Well><i className="fa fa-beer"></i>No Task. Simple life.</Well>
                    }
                        </div>
                    </div>
                </main>
                {this.renderTaskDetail()}
            </div>
        );
    },


    renderStatistics: function () {
        React.render(
            <Statistics project={this.state.project} key={this.state.project._id}/>,
            this.refs.statisticsContainer.getDOMNode()
        );
    },

    scrollToTask: function (taskId) {
        if (!taskId) { return; }
        var $main = $(this.getDOMNode()).find('main');
        var $task = $main.find('[data-id=' + taskId + ']');
        var offsetY = $task.offset().top - 60;
        $main.scrollTop(+offsetY).trigger(MOUSEWHEEL);
    },

    scrollToSelectTask: function () {
        this.scrollToTask(this.state.taskId);
    },

    componentDidMount: function () {
        this.loadProject(this.props.projectId);
        this.loadTodayTaskTime();
        this.onDeleteTaskToken =  this.onDeleteTask.bind(this);
        this.onLogTaskToken = this.onLogTask.bind(this);
        Mt.bind(['command+d', 'ctrl+d'], this.onDeleteTaskToken);
        Mt.bind(['command+l', 'ctrl+l'], this.onLogTaskToken);
        this.myScroll = new IScroll(this.refs.iscrollWrapper.getDOMNode(), {
            mouseWheel: true,
            scrollbars: true,
            interactiveScrollbars: true,
            shrinkScrollbars: 'scale',
            fadeScrollbars: true
        });
    },

    componentDidUpdate: function () {
         this.myScroll.refresh();
     },

    onDeleteTask: function (e) {
        e.preventDefault();
        if (this.currentTask) {
            this.deleteTask(this.currentTask);
        }
    },

    onLogTask: function (e) {
        var that = this;
        e.preventDefault();
        var currentTask = this.currentTask;
        DataAPI.Log.load({
            taskId: currentTask._id,
            sort: 'start:-1',
            limit: 1
        }).then(function (log) {
            Bus.emit(EventConstant.INSERT_LOG_FROM_TASK, log[0]);
            that.transitionTo('logEditor', {date: new Moment().format('YYYY-MM-DD')});
        });
    },

    deleteTask: function (task) {
        var that = this;
        if (!task) {
            return;
        }
        this.setState({
            openTaskDetail: false
        });
        DataAPI.Task.delete(task).then(function () {
            that.loadTasks(that.getRequestParams());
        }).catch(function (err) {
            console.error(err.stack);
            Notify.error('删除Task失败');
        });
    },

    deleteVersion: function (version) {
        var that = this;
        swal({
            title: 'Are you sure to delete ' + version.name + '?',
            text: "You will not be able to recover!",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes, delete it!",
            cancelButtonText: "No, cancel plx!",
            closeOnConfirm: false
        }, function(isConfirm){
            if (isConfirm) {
                DataAPI.Version.delete(version._id).then(function () {
                    swal({
                        title: "Deleted!",
                        text: "Your version has been deleted.",
                        type: "success",
                        timer: 1500
                    });
                    that.props.onVersionDeleted(version);
                });
            }
        });
    },

    componentWillUnmount: function () {
        Mt.unbind(['command+d', 'ctrl+d'], this.onDeleteTaskToken);
        Mt.unbind(['command+l', 'ctrl+l'], this.onLogTaskToken);
    },

    /*shouldComponentUpdate: function (nextProps, nextState) {
        return nextProps.projectId !== this.props.projectId ||
            nextProps.versionId !== this.props.versionId;
    },*/

    getRequestParams: function () {
        var defaultParams = {
            projectId: null,
            versionId: null,
            taskId: null
        };
        if (this.state) {
            var period = this.state.period;
            var dateParams = Util.toDate(period);
            var markedFilter = this.state.markedFilter;
            if (markedFilter) {
                defaultParams.parent = undefined;
            }
            defaultParams.marked = markedFilter;
            defaultParams.status = this.state.taskStatus;
        }
        return _.extend(defaultParams, this.getParams(), dateParams);
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
            $(this.getDOMNode()).scrollTop(0);
            this.setState(_.extend({
                projectLoaded: false,
                openTaskDetail: false,
                taskLoaded: false,
                version: null
            }, params), function () {
                this.loadProject(nextProps.projectId);
                //this.loadTasks(_.pick(nextProps, ['projectId', 'versionId']));
            });
        }
    },

    loadProject: function (projectId) {
        var that = this;
        var taskId = that.state.taskId;
        DataAPI.Project.get(projectId)
            .then(function (project) {
                that.setState({
                    projectLoaded: true,
                    project: project
                });
                return that.loadVersionAndAdapt();
            }).then(function () {
                if (taskId) {
                    DataAPI.Task.get(taskId).then(function (task) {
                        var lastActiveTime = task.lastActiveTime;
                        var period = getPeriod(task.createTime, lastActiveTime);
                        that.setState({
                            taskStatus: task.progress === 100 ? 'done' : (task.progress < 0 ? 'all' : 'doing'),
                            period: period
                        }, function () {
                            loadTasks();
                        });
                    });
                } else {
                    return loadTasks();
                }
            })
            .catch(function (err) {
                console.error(err.stack);
                throw err;
            });

        function loadTasks() {
            return that.loadTasks(that.getRequestParams()).then(function () {
                that.plotTreeMap();
            });
        }
    },

    loadVersionAndAdapt: function () {
        var that = this;
        var versionId = this.state.versionId;
        if (this.state.versionId) {
            return DataAPI.Version.get(versionId).then(function (version) {
                var period = getPeriod(version.createTime, version.lastActiveTime);
                that.setState({
                    version: version,
                    period: period
                });
            });
        } else {
            return Q(1);
        }
    },

    renderTaskDetail: function () {
        if (this.state.openTaskDetail) {
            return <TaskDetail  {... _.pick(this.state, ['projectId', 'versionId'])}
                key={this.currentTask._id}
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
            this.loadTasks(this.getRequestParams()).then(function () {
                if (that.state.openTreeMap) {
                    that.plotTreeMap();
                }
            });
        });
    },

    onPeriodChange: function (period) {
        var that = this;
        this.setState({
            period: period
        }, function () {
            this.loadTasks(this.getRequestParams()).then(function () {
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
            this.loadTasks(this.getRequestParams()).then(function () {
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
        //defaultParams.parent = "null";
        params = _.extend({}, defaultParams, params);
        params.calculateTimeConsume = true;
        if (!params.versionId) {
            params.populateFields = 'version';
        }
        DataAPI.Task.load(params)
            .then(function (tasks) {
                that.setState({
                    taskLoaded: true,
                    tasks: tasks
                }, function () {
                    this.scrollToSelectTask();
                    deferred.resolve(tasks);
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
        var includeVersion = !this.props.versionId; //if user view the whole project, then show version in the tree map
        var tasks = this.state.tasks;
        var currentTask;
        var versions = this.state.project.versions;
        if (includeVersion && !_.isEmpty(versions)) {
            currentTask = {
                children: versions.map(function (version) {
                    var versionId = version._id;
                    return _.extend({
                        name: version.name,
                        children: tasks.filter(function(task) {
                            return task.versionId === versionId;
                        })
                    });
                })
            };
        } else {
            currentTask = {
                children: tasks
            };
        }
        var children = root.children;
        var queue = [].concat(currentTask.children);
        var task, currentNode = root, parentTask = null;
        while (queue.length) {
            children = currentNode.children;
            task = queue.pop();
            newNode = {
                name: task.name,
                value: task.totalTime
            };
            children.push(newNode);
            if (children.length === currentTask.children.length) {
                currentNode = currentNode.parent;
                if (currentNode) {
                    children = currentNode.children;
                }
                currentTask = currentTask.parent;
            }
            if (!_.isEmpty(task.children)) {
                queue = queue.concat(task.children);
                newNode.children = [];
                task.parent = currentTask;
                currentTask = task;
                newNode.parent = currentNode;
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

    openStastics: function () {
        this.refs.statistics.open({
            width: $(this.getDOMNode()).width() - 150
        });
    },


    closeStastics: function () {
        this.refs.statistics.close();
    },

    selectTask: function (task) {
        this.currentTask = task;
    },

    openTask: function (task) {
        if (!task) {return;}
        var useVersion = !!this.props.versionId;
        if (useVersion && task.versionId) {
            url = '/projects/' + task.projectId + '/versions/' + task.versionId + '/tasks/' + task._id;
        } else {
            url = '/projects/' + task.projectId + '/tasks/' + task._id;
        }
        this.selectTask(task);
        this.transitionTo(url);
        this.setState({
            openTaskDetail: true
        });
    },

    filterTaskWithTags: function (tags) {
        var params = this.getRequestParams();
        this._filterTags = tags;
        params.tags = tags.join(',');
        this.loadTasks(params);
    },

    loadTodayTaskTime: function () {
        var that = this;
        return DataAPI.Log.load({
            start: new Moment().startOf('day').toDate(),
            end: new Moment().endOf('day').toDate(),
            group: 'task',
            sum: true
        }).then(function (data) {
            var result = [];
            data.forEach(function (item) {
                var task = item._id;
                if  (task === null) { return; }
                var taskParent = task.parent;
                if (taskParent === null) {
                    result.push({
                        _id: task._id,
                        totalTime: item.totalTime
                    });
                } else {
                    var foundTask = result.some(function (item) {return item._id._id === taskParent});
                    if (!foundTask) {
                        result.push({
                            _id: taskParent,
                            _needCalulate: true,
                            totalTime: 0
                        });
                    }
                }
            });
            result.forEach(function (task) {
                var taskId = task._id;
                var totalTime = 0;
                var _needCalulate = task._needCalulate;
                task.children = data.filter(function (d) {
                    var task = d._id;
                    if (task && task.parent === taskId) {
                        if (_needCalulate) {
                            totalTime += d.totalTime;
                        }
                        return true;
                    }
                }).map(function (d) {
                    return {
                        _id: d._id._id,
                        totalTime: d.totalTime
                    };
                });
                _needCalulate && (task.totalTime = totalTime);
            });
            return result;
        }).then(function (data) {
            that.setState({
                todayTaskTime: data
            });
        });
    }
});


var ProjectInfo = React.createClass({

    propTypes: {
        onFilterTags: React.PropTypes.func
    },

    getInitialState: function () {
        return {
            showProjectDetail: false,
            allTotalTime: null,
            selectTags: []
        };
    },

    toggleProjectDetail: function () {
        this.setState({
            showProjectDetail: !this.state.showProjectDetail
        });
    },

    componentWillMount: function () {
        this.loadTotalTime();
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
                    return (<Tag selectable={true} onClick={this.onTagClick} value={tag}>{tag}</Tag>);
                }, this);
            }
            if (!_.isEmpty(logClasses)) {
                logClasses = logClasses.map(function(cls) {
                    return (<LogClass data={cls}/>);
                });
            }
            var mProjectCreateTime = new Moment(project.createdTime);
            var mProjectLastActiveTime = new Moment(project.lastActiveTime);
            projectBasicInfo = (
                <section className="ltt_c-projectDetail-projectInfo">
                    <h1>
                        {project.name}
                        <span className="ltt_c-projectDetail-logClasses">{logClasses}</span>
                        <span className="ltt_c-projectDetail-times">
                            <span className="ltt-M2">
                                <i className="fa fa-tasks" title="Task count"></i>
                                {project.taskCount}
                            </span>
                            <span className="ltt-M2" title={mProjectCreateTime.format(TIME_FORMAT)}>
                                <i className="fa fa-plus" title="create time"></i>{mProjectCreateTime.fromNow()}
                            </span>
                            <span className="ltt-M2" title={mProjectLastActiveTime.format(TIME_FORMAT)}>
                                <i className="fa fa-child" title="last active"></i>{mProjectLastActiveTime.fromNow()}
                            </span>
                            <span className="ltt-M2">
                                <i className="fa fa-clock-o" title="Total time"></i>
                                {Moment.duration(project.totalTime, "minutes").format("M[m],d[d],h[h],mm[min]")} across {mProjectLastActiveTime.from(mProjectCreateTime, true)}
                                {this.state.allTotalTime ? <span className="percent">
                                    <span className="num">{(project.totalTime / this.state.allTotalTime * 100).toFixed(1)}%</span>
                                    of total time
                                </span> : null}
                            </span>
                        </span>
                    </h1>
                    <span className="openDetail" onClick={this.toggleProjectDetail}>
                        <i className={this.state.showProjectDetail ? "fa fa-chevron-circle-down" : "fa fa-chevron-circle-right"}></i>
                    </span>
                    {this.state.showProjectDetail ? <div className="ltt_c-projectDetail-projectInfo-detail">
                        <p className="ltt_c-projectDetail-tags">{tags}</p>
                    </div> : null}
                    {this.props.versionId ?
                        <VersionInfo id={this.props.versionId}
                            projectTotalTime={project.totalTime}
                            onDeleteVersion={this.props.onDeleteVersion}/> : null}
                </section>
            );
        } else {
            projectBasicInfo = <div></div>
        }
        return projectBasicInfo;
    },

    onTagClick: function (tag, select) {
        var selectTags = this.state.selectTags;
        var index = selectTags.indexOf(tag);
        if (index >= 0 && select === false) {
            selectTags.splice(index, 1);
        } else {
            selectTags.push(tag);
        }
        this.setState({
            selectTags: selectTags
        }, function () {
            this.props.onFilterTags && this.props.onFilterTags(this.state.selectTags);
        });
    },

    loadTotalTime: function () {
        var that = this;
        DataAPI.Log.totalTime()
            .then(function (total) {
                that.setState({
                    allTotalTime: total
                });
            });
    }
});




var VersionInfo = React.createClass({

    mixins: [PureRenderMixin],

    getInitialState: function () {
        return {
            loading: true,
            version: null
        };
    },

    render: function () {
        var version = this.state.version;
        var projectTotalTime = this.props.projectTotalTime;
        return version ? (
            <div className="ltt_p-projectDetail-versionInfo">
                <div className="ltt_p-projectDetail-versionInfo-content">
                    <span className="version-name"><i className="fa fa-sitemap">{version.name}</i></span>
                    <span>
                        <i className="fa fa-tasks" title="Task count"></i>
                        {version.taskCount}
                    </span>
                    <span title={new Moment(version.createTime).format('YYYY-MM-DD HH:mm:ss')}>
                        <i className="fa fa-plus" title="create time"></i>
                        {new Moment(version.createTime).fromNow()}
                    </span>
                    <span title={new Moment(version.lastActiveTime).format('YYYY-MM-DD HH:mm:ss')}>
                        <i className="fa fa-user" title="last active"></i>
                        {new Moment(version.lastActiveTime).fromNow()}
                    </span>
                    <span className="ltt-M2">
                        <i className="fa fa-clock-o" title="Total time"></i>
                        {Moment.duration(version.totalTime, "minutes").format("M[m],d[d],h[h],mm[min]")} across {new Moment(version.createTime).from(version.lastActiveTime, true)}
                        <span className="percent">
                            <span className="num">{(version.totalTime / projectTotalTime * 100).toFixed(1)}%</span>
                            of project time
                        </span>
                    </span>
                </div>
                <div className="ltt_p-projectDetail-versionInfo-btns">
                    <Button onClick={this.props.onDeleteVersion.bind(this, version)} bsStyle="danger" bsSize="xsmall">
                        <i className="fa fa-trash-o"/>Delete
                    </Button>
                </div>
            </div>
        ) : null;
    },

    componentDidMount: function () {
        this.loadVersion();
    },

    componentWillReceiveProps: function (nextProps) {
        if (this.props.id !== nextProps.id) {
            this.loadVersion(nextProps.id);
        }
    },

    loadVersion: function (id) {
        var that = this;
        DataAPI.Version.get(id || this.props.id).then(function (version) {
            that.setState({
                version: version
            });
        });
    }
});


function getPeriod(createTime, lastActiveTime) {
    var period;
    if (Util.isInToday(createTime) && Util.isInToday(lastActiveTime)) {
        period = 'today';
    } else if (Util.isInYesterday(createTime) && Util.isInYesterday(lastActiveTime)) {
        period = 'yesterday';
    } else if (Util.isInThisWeek(createTime) && Util.isInThisWeek(lastActiveTime)) {
        period = 'week';
    } else if (Util.isInThisMonth(createTime) && Util.isInThisMonth(lastActiveTime)) {
        period = 'month';
    } else if (Util.isInThisYear(createTime) && Util.isInThisYear(lastActiveTime)) {
        period = 'year';
    } else {
        period = 'all';
    }
    return period;
}



var Statistics = React.createClass({

    getInitialState: function () {
        return {
            versionDataLoaded: false,
            versionData: null
        };
    },

    render: function () {
        var versionData = this.state.versionData;
        return <div className="ltt_c-projectTask-statistics">
            {
                !_.isEmpty(versionData) ?
                <Bar data={this.convertData(versionData)} exporting={false}  legend={false}/>
                :
                null
            }
        </div>
    },


    componentDidMount: function () {
        this.loadVersionData();
    },

    loadVersionData: function () {
        var that = this;
        DataAPI.Log.load({
            projects: this.props.project.name,
            sum: true,
            group: 'version'
        }).then(function (list) {
            return list.filter(function (item) {
                return item._id !== null;
            }).sort(function (a, b){
                return b.totalTime - a.totalTime;
            });
        }).then(function (data) {
            that.setState({
                versionDataLoaded: true,
                versionData: data
            });
        });
    },

    convertData: function (data) {
        return data.map(function (item) {
            var name;
            if (item._id && item._id.name) {
                name = item._id.name;
            } else {
                name = item._id || 'unknow';
            }
            return {
                label: name,
                value: item.totalTime
            };
        });
    }
})