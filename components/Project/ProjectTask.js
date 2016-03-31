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
var Ltt = window.Ltt;
var PureRenderMixin = require('react/addons').addons.PureRenderMixin;
var Mt = window.Mousetrap;
var RB = require('react-bootstrap');
var ButtonToolbar = RB.ButtonToolbar;
var Button = RB.Button;
var ButtonGroup = RB.ButtonGroup;
var OverlayTrigger = RB.OverlayTrigger;
var Tooltip = RB.Tooltip;
var Well = RB.Well;
var extend = require('extend');
var swal = require('sweetalert');
var mui = require('material-ui');
var ThemeManager = require('material-ui/lib/styles/theme-manager');
var DefaultRawTheme = require('material-ui/lib/styles/raw-themes/light-raw-theme');
var IScroll = require('../../libs/iscroll');
var config = require('../../conf/config');
var EasyPieChart = require('easyPieChart');
var noop = function () {};



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
var FullDateRangePicker = require('../FullDateRangePicker');
var Scroller = require('../Scroller');
var TimeConsumeRanking = require('../TimeConsumeRanking');
var D3SimpleColumn = require('../charts/D3SimpleColumn.js');
var TinyBar = require('../charts/TinyBar.js');
var TinyPie = require('../charts/TinyPie.js');
var RecentActivitiesFull = require('../RecentActivitiesFull');


/** components/charts */
var TreeMap = require('../charts/TreeMap');
var Bar = require('../charts/Bar');
var Column = require('../charts/Column');
var Line = require('../charts/Line');

/** Store */
var MemStore = require('../../stores/MemStore');

/** Constants */
var GlobalConstants = require('../../constants/GlobalConstants');


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
            openTaskDetail: false,
            openTreeMap: false,
            markedFilter: false,
            taskStatus: 'doing',
            project: null,
            todayTaskTime: [],
            tasks: []
        }, Util.toDate('month'), this.getStateFromParams());
    },

    componentWillMount: function () {
        if (this.state.taskId) {
            var task = MemStore.get(GlobalConstants.STORE_PROJECT_INDEX_TASK_ID);
            var state = {
                openTaskDetail: true
            };
            if (task && this.state.taskId === task._id) {
                if (task.lastActiveTime) {
                    this._end = new Moment(task.lastActiveTime).endOf('day').toDate();
                    this._start = new Moment(task.lastActiveTime).subtract(1, 'week').startOf('day').toDate();
                }
                if (task.progress === 100) {
                    state.taskStatus = 'done';
                }
            }
            this.setState(state);
        }
    },

    getChildContext: function() {
        return {
            muiTheme: ThemeManager.getMuiTheme(DefaultRawTheme)
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
                <main onClick={this.onMainClick}>
                    <div className="ltt_c-projectDetail">
                        <ProjectInfo ref="projectInfo"
                            onDateColumnClick={this.openLogSlider}
                            project={project}
                            versionId={currentVersionId}
                            onDeleteVersion={this.deleteVersion}
                            onFilterTags={this.filterTaskWithTags}/>
                    </div>
                    <div className="ltt_c-projectTask-toolbar">
                        <FullDateRangePicker
                            bsSize="xsmall"
                            period="week"
                            granularity="week"
                            start={this._start}
                            end={this._end}
                            compare={false}
                            showCompare={false}
                            onDateRangeInit={this.onDateRangeInit}
                            onDateRangeChange={this.onDateRangeChange}
                            className="ltt_c-projectTask-dateRange"/>
                    </div>
                    <SlidePanel key={this.props.projectId  + 's1'}
                        stopPropagationClick={true}
                        ref="treeMapSlider" open={false} openRight={true} onTransitionEnd={this.renderTreeMap}
                        position="fixed" zIndex={10000}>
                        <div className="content">
                            <h3>Time TreeMap of {(project ? project.name : '') + (version ? '-' + version.name : '')}</h3>
                            <div className="closeBtn" onClick={this.closeTreeMap}><i className="fa fa-close"/></div>
                            <div ref="treeMapContainer"></div>
                        </div>
                    </SlidePanel>

                    <SlidePanel key={this.props.projectId  + 's_logs'}
                        stopPropagationClick={true}
                        ref="logSlider" open={false} openRight={true} onTransitionEnd={this.renderLogsOfOneDate} position="fixed" zIndex={10000}>
                        <div className="content">
                            <div className="closeBtn" onClick={this.closeLogSlider}><i className="fa fa-close"/></div>
                            <div ref="logsContainer"></div>
                        </div>
                    </SlidePanel>
                    <SlidePanel key={this.props.projectId + 's2'}
                    stopPropagationClick={true}
                        ref="statistics" open={false} openRight={true} onTransitionEnd={this.renderStatistics}
                        position="fixed" zIndex={10000}>
                        <div className="closeBtn" onClick={this.closeStastics}><i className="fa fa-close"/></div>
                        <div className="content" ref="statisticsContainer"></div>
                    </SlidePanel>
                    <div className="ltt_c-projectTask-moreInfo">
                        <div>
                            <span className="ltt-number">Count: {this.state.tasks.length}, </span>
                            <span className="ltt-time">Time: {Util.displayTime(this.state.tasks.reduce(function (s, t) { return t.totalTime + s;}, 0))}</span>
                        </div>
                        <div className="btn-container">
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
                                defaultIsOpen={taskStatus === "doing"}
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


    onMainClick: function () {
        if (this.state.openTaskDetail) {
            this.setState({
                openTaskDetail: false
            });
        }
        if (this.__openStastics) {
            this.closeStastics();
        }
        if (this.__treeMapOpened) {
            this.closeTreeMap();
        }
        if (this.__logSliderOpened) {
            this.closeLogSlider();
        }
    },


    renderStatistics: function () {
        React.render(
            <Statistics project={this.state.project} key={this.state.project._id}/>,
            this.refs.statisticsContainer.getDOMNode()
        );
    },

    renderTreeMap: function () {
        var that = this;
        React.render(
            //"Time TreeMap of " + project.name + (version ? '-' + version.name : '')
            <TreeMap className="ltt_c-ProjectTask-treeMap"/>,
            this.refs.treeMapContainer.getDOMNode(),
            function () {
                that._treeMap = this;
                that.plotTreeMap();
            }
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
        this.gotoLastLogToken = this.gotoLastLog.bind(this);
        Mt.bind(['command+d', 'ctrl+d'], this.onDeleteTaskToken);
        Mt.bind(['command+l', 'ctrl+l'], this.onLogTaskToken);
        Mt.bind(['command+/', 'ctrl+/'], this.gotoLastLogToken);
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
        this.refs.taskDetailScroller.refresh();
     },

    onDeleteTask: function (e) {
        e.preventDefault();
        if (this.currentTask) {
            this.deleteTask(this.currentTask);
        }
    },

    gotoLastLog: function (e) {
        var that = this;
        e.preventDefault();
        var currentTask = this.currentTask;
        DataAPI.Log.load({
            taskId: currentTask._id,
            sort: 'start:-1',
            limit: 1
        }).then(function (log) {
            log = log[0];
            if (log) {
                location.hash = '/logEditor/' +  Moment(log.date).format(Util.DATE_FORMAT) + '?logOrigin=' +  encodeURIComponent(log.origin);
            }
        });
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
            log = log[0];
            if (!log) { return; }
            Bus.emit(EventConstant.INSERT_LOG_FROM_TASK, log);
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
        Mt.unbind(['command+/', 'ctrl+/'], this.gotoLastLogToken);
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
            var dateParams = {start: this._start, end: this._end};
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
                        //var period = getPeriod(task.createTime, lastActiveTime);
                        that.setState({
                            taskStatus: task.progress === 100 ? 'done' : (task.progress < 0 ? 'all' : 'doing')
                            //period: period
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
                //var period = getPeriod(version.createTime, version.lastActiveTime);
                that.setState({
                    version: version
                    //period: period
                });
            });
        } else {
            return Q(1);
        }
    },

    renderTaskDetail: function () {
        if (!this.currentTask) {
            var taskId = this.state.taskId;
            var cTask;
            this.state.tasks.some(function (task) {
                if (task._id === taskId) {
                    cTask = task;
                    return true;
                }
                return false;
            });
            this.currentTask = cTask;
        }
        return <SlidePanel ref="taskDetailSlider" key={this.props.projectId + 'task-detail'} open={(!!this.currentTask) && this.state.openTaskDetail} openRight={true}
                    stopPropagationClick={true}
                    position="fixed" zIndex={10000} className="taskDetailSlider" width={300}>
            <div className="ltt_c-taskDetail-wrapper" ref="taskDetailWrapper">
                <Scroller ref="taskDetailScroller" className="ltt_c-taskDetail-wrapper-scroller">
                    {!!this.currentTask ? <TaskDetail  {... _.pick(this.state, ['projectId', 'versionId'])}
                        key={this.currentTask._id}
                        onHidden={this.closeTaskDetail}
                        onLogsLoaded={this.onTaskLogsLoaded}
                        onChange={this.onTaskChange}
                        task={this.currentTask}/> : null }
                </Scroller>
            </div>
        </SlidePanel>
    },

    closeTaskDetail: function () {
        this.setState({
            openTaskDetail: false
        });
    },

    onTaskLogsLoaded: function () {
        this.refs.taskDetailScroller.refresh();
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
                if (that.__treeMapOpened) {
                    that.plotTreeMap();
                }
            });
        });
    },

    onDateRangeInit: function(start, end) {
        this._start = start;
        this._end = end;
    },

    onDateRangeChange: function (start, end) {
        this._start = start;
        this._end = end;
        this.loadTasks(this.getRequestParams()).then(function () {
            if (that.__treeMapOpened) {
                that.plotTreeMap();
            }
        });
    },

    onPeriodChange: function (period) {
        var that = this;
        this.setState({
            period: period
        }, function () {
            this.loadTasks(this.getRequestParams()).then(function () {
                if (that.__treeMapOpened) {
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
                if (that.__treeMapOpened) {
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
        if (!this._treeMap) {return;}
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
                            var taskVersionId = task.versionId;
                            if (_.isObject(taskVersionId)) {
                                return taskVersionId._id === versionId;
                            } else {
                                return taskVersionId === versionId;
                            }
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
        this._treeMap.plot(root);
    },

    openTreeMap: function (e) {
        e.preventDefault();
        e.stopPropagation();
        this.__treeMapOpened = true;
        this.refs.treeMapSlider.open({
            width: $(this.getDOMNode()).width() - 150
        });
    },

    closeTreeMap: function () {
        this.__treeMapOpened = false;
        this._treeMap = null;
        this.refs.treeMapSlider.close();
    },

    openLogSlider: function (dateData) {
        this.__logSliderOpened = true;
        this.__logsSliderDateData = dateData;
        this.refs.logSlider.open({
            width: 300
        });
    },

    renderLogsOfOneDate: function (date) {
        var that = this;
        var project = this.state.project;
        var dateData = this.__logsSliderDateData;
        if (!dateData) { return; }
        if (!project) { return; }
        var date = dateData.date;
        React.render(
            //"Time TreeMap of " + project.name + (version ? '-' + version.name : '')
            <div class="logsOfoneDate">
                <h1 style={{textAlign: 'center'}}>{new Moment(dateData.date).format(Util.DATE_FORMAT)}</h1>
                <RecentActivitiesFull key={'reactactivitys' + date} params={{projects: project.name, date: date}}/>
            </div>,
            this.refs.logsContainer.getDOMNode()
        );
    },

    closeLogSlider: function () {
        this.__logSliderOpened = false;
        this.refs.logSlider.close();
    },

    openStastics: function (e) {
        e.preventDefault();
        e.stopPropagation();
        this.__openStastics = true;
        this.refs.statistics.open({
            width: $(this.getDOMNode()).width() - 150
        });
    },


    closeStastics: function () {
        this.refs.statistics.close();
        this.__openStastics = false;
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

    mixins: [PureRenderMixin, Router.State, Router.Navigation],

    propTypes: {
        onFilterTags: React.PropTypes.func
    },

    getDefaultProps: function () {
        return {
            onDateColumnClick: noop
        };
    },

    getInitialState: function () {
        return {
            showProjectDetail: false,
            selectTags: []
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
                logClasses = project.classes,
                versoins = project.versions;
            if (!_.isEmpty(tags)) {
                tags = tags.map(function (tag) {
                    return (<Tag selectable={true} onClick={this.onTagClick} value={tag}>{tag}</Tag>);
                }, this);
            }
            if (!_.isEmpty(logClasses)) {
                classesConfig = config.classes;
                logClasses = logClasses.map(function(cls) {
                    var cls = _.find(classesConfig, {'_id': cls});
                    return cls ? <LogClass data={cls}/> : null;
                });
            }
            var mProjectCreateTime = new Moment(project.createdTime);
            var mProjectLastActiveTime = new Moment(project.lastActiveTime);
            var linkEl, link;
            if (project.attributes && (link = project.attributes.link)) {
                linkEl = <span className="icon-btn external-link ltt-link" onClick={this.openExternalLink.bind(this, link)} title={link}><i className="fa fa-external-link"></i></span>
            }
            projectBasicInfo = (
                <section className="ltt_c-projectDetail-projectInfo">
                    <div className="projectInfo-container"  style={{display: "flex"}}>
                        <div className="basicInfo">
                            <h1 className="title">{project.name}{linkEl}<span className="ltt-link icon-btn" onClick={this.insertLog}><i className="fa fa-pencil-square-o"/></span></h1>
                            <div className="timeinfos">
                                <div className="ltt_c-projectDetail-logClasses">{logClasses}</div>
                                <div className="timeinfo-item" title={mProjectCreateTime.format(TIME_FORMAT)}>
                                    <i className="fa fa-plus" title="create time"></i>{mProjectCreateTime.fromNow()}
                                </div>
                                <div className="timeinfo-item" title={mProjectLastActiveTime.format(TIME_FORMAT)}>
                                    <i className="fa fa-child" title="last active"></i>{mProjectLastActiveTime.fromNow()}
                                </div>
                                <div className="timeinfo-item">
                                    <ProjectTimeChart key={"projecttimechart" + project._id} project={project}/>
                                </div>
                            </div>
                        </div>
                        <div className="chartsInfo">
                            <RecentTaskTrend project={project}/>
                            <TaskCountChart key={"taskcountchart" + project._id} project={project} width={70}/>
                            <div className="moreinfo" style={{width: 150}}>
                                <div className="moreinfo-item"><span className="ltt-num">{versoins.length}</span> Versions</div>
                                <div className="moreinfo-item"><span className="ltt-num">{tags.length}</span> Tags</div>
                                <div className="moreinfo-item"><span className="ltt-num">{logClasses.length}</span> Classes</div>
                            </div>
                        </div>
                        <ActivityChart project={project} onActicityClick={this.props.onDateColumnClick} start={Moment(mProjectLastActiveTime).subtract(3, 'month').toDate()} end={mProjectLastActiveTime.toDate()}/>
                    </div>
                    {this.props.versionId ?
                        <VersionInfo id={this.props.versionId}
                            project={this.props.project}
                            projectTotalTime={project.totalTime}
                            onDeleteVersion={this.props.onDeleteVersion}/> : null}
                </section>
            );
        } else {
            projectBasicInfo = <div></div>
        }
        return projectBasicInfo;
    },

    insertLog: function (e) {
        e.preventDefault();
        e.stopPropagation();
        var project = this.props.project;
        var that = this;
        DataAPI.Log.load({
            projectId: project._id,
            sort: 'start:-1',
            limit: 1
        }).then(function (log) {
            if (!_.isEmpty(log)) {
                Bus.emit(EventConstant.INSERT_LOG_FROM_TASK, log[0]);
                that.transitionTo('logEditor', {date: new Moment().format('YYYY-MM-DD')});
            }
        });
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

    

    openExternalLink: function (link) {
        Ltt.openExternalLink(link);
    }
});

var ProjectTimeChart = React.createClass({

    getInitialState: function () {
        return {
            allTotalTime: 0
        }
    },

    render: function () {
        var project = this.props.project;
        var mProjectLastActiveTime = new Moment(project.lastActiveTime);
        var mProjectCreateTime = new Moment(project.createdTime);
        if (this.state.allTotalTime) {
            var projectTimePercent = (project.totalTime / this.state.allTotalTime * 100).toFixed(1);
        }
        return <div className="ProjectTimeChart">
            {this.state.allTotalTime ? <TinyPie value={[project.totalTime, this.state.allTotalTime].join('/')} height={20} width={20}/>
            : null}
            <span className="desc">
                {projectTimePercent + '%'} {Moment.duration(project.totalTime, "minutes").format("M[m],d[d],h[h],mm[min]")} across {mProjectLastActiveTime.from(mProjectCreateTime, true)}
            </span>
        </div>
    },
    loadTotalTime: function () {
        var that = this;
        DataAPI.Log.totalTime()
            .then(function (total) {
                that.setState({
                    allTotalTime: total
                }, function () {
                    //new EasyPieChart(this.refs.projectTimePercent.getDOMNode(), {size: 15, barColor: "#86e01e"});
                });
            });
    },
    componentDidMount: function () {
        this.loadTotalTime();
    }
});


var TaskCountChart = React.createClass({

    getInitialState: function () {
        return {
            doingTaskCount: 0,
            doneTaskCount: 0
        };
    },

    render: function () {
        var doing = this.state.doingTaskCount;
        var done = this.state.doneTaskCount;
        var total = doing + done;
        var percent = done / total * 100;
        if (total === 0) {return null;}
        return <div className="chart-item TaskCountChart">
            {total > 0 ?
            <div className="pieChart" ref="easychart" data-percent={percent}>{percent.toFixed(1) + '%'}</div>
            : null}
            <div className="desc">
                <p className="item"> <span className="ltt-num">{total}</span> Total</p>
                <p className="item"> <span className="ltt-num">{doing}</span> Doing</p>
                <p className="item"><span className="ltt-num">{done}</span>  Done</p>
            </div>
        </div>
    },

    loadTaskInfo: function () {
        var that = this;
        var project = this.props.project;
        if (!project) {return;}
        Q.allSettled([
            DataAPI.Task.count({projectId: project._id, status: 'doing'}),
            DataAPI.Task.count({projectId: project._id, status: 'done'})
        ]).spread(function (doingResult, doneResult) {
            that.setState({
                doingTaskCount: doingResult.value,
                doneTaskCount: doneResult.value
            }, function () {
                new EasyPieChart(this.refs.easychart.getDOMNode(), {size: this.props.width, barColor: "#86e01e"});
            });
        })
    },

    componentDidMount: function () {
        this.loadTaskInfo();
    }
});


var RecentTaskTrend = React.createClass({
    render: function () {
        var project = this.props.project;
        return <div className="chart-item" style={{width: 100}}>
            <div className="chart-item-content" style={{marginTop:50}}>
                <TinyBar value={function () {
                var today = new Moment();
                var end = today.format(Util.DATE_FORMAT);
                var start = today.subtract(20, 'day').format(Util.DATE_FORMAT);
                var that = this;
                return DataAPI.Task.trend({
                    projectId: project._id,
                    group: 'day',
                    list: false,
                    start: start,
                    end: end
                }).then(function (data) {
                    return Util.fillDataGap(data, start, end, function (d) {
                        return d.count;
                    }).join(',');
                });
            }} width={100} height={25}/></div>
            <div className="desc">
                Task trend
            </div>
        </div>
    }
})


var ActivityChart = React.createClass({

    getInitialState: function () {
        return {
            activityData: []
        };
    },

    getDefaultProps: function () {
        return {
            onActicityClick: noop
        };
    },

    render: function () {
        return <div className="ActivityChart">
            <D3SimpleColumn data={this.state.activityData.map(function (d) { return d.count;})} height={50} onClick={this.handleD3ColumnClick} fill={'rgba(242, 242, 242, 0.66)'}/>
        </div>
    },

    componentDidMount: function () {
        this.loadActivity();
    },


    loadActivity: function () {
        var that = this;
        var start = this.props.start;
        var end = this.props.end;
        DataAPI.Log.load({
            sum: true,
            start: start,
            end: end,
            projects: this.props.project.name,
            group: 'date'
        }).then(function (data) {
            var result = Util.fillDataGap(data, start, end);
            that.setState({
                activityData: result
            });
        });
    },

    handleD3ColumnClick: function(el, data, index) {
        var data = this.state.activityData[index];
        var date = data.date;
        if (date) {
            this.props.onActicityClick(data);
        }
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
        var mCreateTime, mLastActiveTime, tooltip;
        if (version) {
            mCreateTime = new Moment(version.createTime);
            mLastActiveTime = new Moment(version.lastActiveTime);
            tooltip = <Tooltip> {mCreateTime.format('YYYY-MM-DD') + ' ~ ' + mLastActiveTime.format('YYYY-MM-DD')}</Tooltip>
        }
        return version ? (
            <div className="ltt_p-projectDetail-versionInfo">
                <div className="ltt_p-projectDetail-versionInfo-content">
                    <span className="version-name"><i className="fa fa-sitemap"></i>{version.name}</span>
                    <span>
                        <i className="fa fa-tasks" title="Task count"></i>
                        {version.taskCount}
                    </span>
                    <span title={'create at ' + mCreateTime.format('YYYY-MM-DD HH:mm:ss')}>
                        <i className="fa fa-plus" title="create time"></i>{mCreateTime.fromNow()}
                    </span>
                    <span title={'last active at ' + mLastActiveTime.format('YYYY-MM-DD HH:mm:ss')}>
                        <i className="fa fa-user" title="last active"></i> {mLastActiveTime.fromNow()}
                    </span>
                    <span className="ltt-M2">
                        <i className="fa fa-clock-o" title="Total time"></i>
                        {Moment.duration(version.totalTime, "minutes").format("M[m],d[d],h[h],mm[min]")} across
                        <OverlayTrigger placement="bottom" overlay={tooltip} delay={10}>
                            <span> {new Moment(version.createTime).from(version.lastActiveTime, true)}</span>
                        </OverlayTrigger>
                        <span className="percent">
                            <span className="num">{(version.totalTime / projectTotalTime * 100).toFixed(1)}%</span> of {this.props.project.name}
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
                [
                <h2>Version Bar</h2>,
                <Bar data={this.convertData(versionData)} exporting={false}  legend={false}/>
                ] : null
            }
            <h2>Top 10 List</h2>
            <TimeConsumeRanking tabs={['tags', 'classes', 'task']}
                    params={{
                        projects: this.props.project.name,
                        limit: 10
                    }}/>
            <TaskTrend project={this.props.project}/>
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
});


var TaskTrend = React.createClass({

    getInitialState: function () {
        return {
            taskTrendData: null,
            trendGroupOption: 'day'
        };
    },

    componentDidMount: function () {
        this.loadTaskTrendData();
    },

    render: function () {
        var trendGroupOption = this.state.trendGroupOption;
        return (
        <div>
            <h2> Task Trend <ButtonGroup>
                {['year', 'month', 'week', 'day'].map(function (type) {
                    return <Button bsSize='xsmall' active={trendGroupOption === type} onClick={this._onTaskTrendGroupOptionChange.bind(this, type)}>{type}</Button>
                }, this)}</ButtonGroup>
            </h2>
            <Column legend={false} convert={false} data={[{data: this.state.taskTrendData}]}/>
        </div>
        );
    },

    _onTaskTrendGroupOptionChange: function (type) {
        this.setState({
            trendGroupOption: type
        }, function () {
            this.loadTaskTrendData();
        });
    },

    loadTaskTrendData: function () {
        var that = this;
        return DataAPI.Task.trend({
            projectId: this.props.project._id,
            group: this.state.trendGroupOption,
            list: false
        }).then(function (data) {
            that.setState({
                taskTrendData: data.map(function (d) {
                    return [d._id, d.count];
                })
            });
        })
    }
})