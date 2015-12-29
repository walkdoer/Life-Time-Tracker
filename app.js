/**
 * application bootstrap
 * @jsx React.DOM
 */



var React = require('react');
var $ = require('jquery');window.$ = window.Jquery = $;
var addons = require('react/addons').addons;
var cx = addons.classSet;
var numeral = require('numeral');
var Ltt = global.Ltt;
var Router = require('react-router');
var Link = Router.Link;
var State = Router.State;
var RouteHandler = Router.RouteHandler;
var Moment = require('moment');
var _ = require('lodash');
var path = require('path');
var ReactBootStrap = require('react-bootstrap');
var OverlayTrigger = ReactBootStrap.OverlayTrigger;
var Popover = ReactBootStrap.Popover;
var Button = ReactBootStrap.Button;
var Badge = ReactBootStrap.Badge;
var Q = require('q');
var config = require('./conf/config');
var PureRenderMixin = require('react/addons').addons.PureRenderMixin;
var d3 = require('d3');
window.d3 = d3;

/** Components */
var Header = require('./components/Header');
var Nav = require('./components/Nav');
var EnergyBar = require('./components/EnergyBar');
var Tag = require('./components/Tag');

/* Const */
var NAV_OPEN = 'ltt__navOpen';
var EVENT = require('./constants/EventConstant');
window.EVENT = EVENT;
var GlobalConstants = require('./constants/GlobalConstants');
/** Store */
var MemStore = require('./stores/MemStore');

/** Utils */
var Util =require('./utils/Util');
var DataAPI = require('./utils/DataAPI');
var Bus = require('./utils/Bus');
window.__LttBus__ = Bus;
var NWBridge = require('./NWBridge');

NWBridge.init();

var App = React.createClass({


    mixins: [State],
    getInitialState: function () {
        return {
            openNav: true,
            isFullscreen: false
        };
    },


    render: function () {
        var clsObj = {ltt: true};
        var className = cx(clsObj);
        return (
            <div className={className}>
                <Header
                    isFullscreen={this.state.isFullscreen}
                    onEnterFullscreen={this.enterFullscreen}
                    onLeaveFullscreen={this.leaveFullscreen}/>
                <div className="ltt_c-outerContainer">
                    <Nav initialMenuItem={this.getCurrentPage()} ref="nav"/>
                    <section className="ltt_c-innerContainer">
                        <RouteHandler/>
                    </section>
                </div>
                <Footer/>
            </div>
        );
    },

    componentDidMount: function () {
        this.$el = $(this.getDOMNode());
    },

    getCurrentPage: function () {
        var path = this.getPath();
        return path.split('/')[1];
    },


    leaveFullscreen: function () {
        Ltt.leaveFullscreen();
        this.setState({
            isFullscreen: false
        });
    },

    enterFullscreen: function () {
        Ltt.enterFullscreen();
        this.setState({
            isFullscreen: true
        });
    },

    isFullscreen: function () {
        if (Ltt) {
            return Ltt.isFullscreen();
        } else {
            return null;
        }
    },

});

var SetIntervalMixin = require('./components/mixins/setInterval');

var Footer = React.createClass({

    mixins: [SetIntervalMixin, PureRenderMixin, Router.State, Router.Navigation],

    getInitialState: function () {
        return {
            projectCount: 0,
            unsyncDate: []
        };
    },

    render: function () {
        return (
            <footer className="ltt-footer">
                <div className="ltt-footer-left">
                    <div className="btn-group">
                        <button className="btn btn-xs"><i className="fa fa-plus"></i></button>
                    </div>
                    <EnergyBar/>
                </div>
                <div className="ltt-footer-log">
                    <div className="ltt-footer-log-content" ref="logContent"></div>
                    <div className="lastTime" ref="lastTime"></div>
                </div>
                <div className="ltt_c-appInfo">
                    <div className="ltt_c-appInfo-stat animated">
                        <span className="ltt_c-appInfo-projectCount">
                            <i className="fa fa-rocket"></i>
                            <span className="ltt_c-number">{this.state.projectCount}</span>
                        </span>
                        <span className="ltt_c-appInfo-taskCount">
                            <i className="fa fa-tasks"></i>
                            <span className="ltt_c-number">{this.state.taskCount}</span>
                        </span>
                        <span className="ltt_c-appInfo-logCount">
                            <i className="fa fa-file"></i>
                            <span className="ltt_c-number">{this.state.logCount}</span>
                        </span>
                        {
                        this.state.totalTime > 0?
                        <span className="ltt_c-appInfo-totalTime">
                            <i className="fa fa-clock-o"></i>
                            <span className="ltt_c-number">{Util.displayTime(this.state.totalTime)}</span>
                        </span> : null
                        }
                    </div>
                    <AppProcessInfo ref="appProcessInfo"/>
                </div>
            </footer>
        );
    },

    renderUnSyncInfo: function () {
        var unsyncDateInfo;
        var that = this;
        var hideMore;
        var unsyncDateLen = this.state.unsyncDate.length;
        if (unsyncDateLen > 0) {
            if (unsyncDateLen > 5 ) {
                hideMore = <p style={{margin: '3', 'text-align': 'center'}}>...</p>;
            }
            var popOver = (
                <Popover title="Unsync dates">
                    <Button bsStyle='primary' bsSize='xsmall' onClick={this.backUpAllLogFile}>
                        <i className={cx({"fa fa-refresh": true, "fa-spin": this.state.syncingAll})} style={{'margin-right': '4px'}}></i>
                        Backup All<Badge>{unsyncDateLen}</Badge>
                    </Button>
                    {this.state.unsyncDate.slice(0, 5).map(function (date) {
                        return <p className="ltt_c-appInfo-unsyncDate-date">
                            {date}
                            <i className="fa fa-refresh" style={{'margin-left': '4px'}}
                             onClick={that.backUpLogFileByDate.bind(that, date)}></i>
                        </p>
                    })}
                    {hideMore}
                </Popover>
            );
            unsyncDateInfo = (
                <OverlayTrigger trigger="click" placement="top" overlay={popOver} ref="overlayTrigger">
                    <span className="ltt_c-appInfo-unsyncDate">
                        <i className="fa fa-asterisk" style={{color: 'red'}}></i>
                        <span className="ltt_c-number">{this.state.unsyncDate.length}</span>
                    </span>
                </OverlayTrigger>
            );
        }
        return unsyncDateInfo;
    },

    backUpLogFileByDate: function (date) {
        var that = this;
        return DataAPI.backUpLogFileByDate(date).then(function () {
            var unsyncDate = that.state.unsyncDate;
            unsyncDate = _.without(unsyncDate, date);
            that.setState({
                unsyncDate: unsyncDate
            }, function () {
                this.refs.overlayTrigger.updateOverlayPosition();
            });
        });
    },

    backUpAllLogFile: function () {
        var that = this;
        this.setState({
            syncingAll: true
        }, function () {
            var that = this;
            Q.allSettled(this.state.unsyncDate.map(function (date) {
                that.backUpLogFileByDate(date);
            })).then(function () {
                that.setState({
                    syncingAll: false
                });
            });
        });
    },

    componentWillMount: function () {
        this.updateLastTimeToken = this.updateLastTime.bind(this);
        this.updateCurrentLogToken = this.updateCurrentLog.bind(this);
        this.loadTotalTimeToken = this.loadTotalTime.bind(this);
        Bus.addListener(EVENT.DOING_LOG, this.updateLastTimeToken);
        Bus.addListener(EVENT.CURRENT_LOG, this.updateCurrentLogToken);
        Bus.addListener(EVENT.UPDATE_APP_INFO, this.loadAppInfo);
        Bus.addListener(EVENT.UPDATE_APP_INFO, this.loadTotalTimeToken);
        Bus.addListener(EVENT.UPDATE_PROCESS_INDO, this.updateProcessInfo);
        //Bus.addListener(EVENT.CHECK_SYNC_STATUS, this.checkSyncStatus);
    },

    componentDidMount: function () {
        var that = this;
        this.loadAppInfo();
        this.loadTotalTime();
        Ltt.on('quit', function () {
            that._stopNotify();
        });
        //this.checkSyncStatus();
    },

    componentWillUnmount: function () {
        Bus.removeListener(EVENT.DOING_LOG, this.updateLastTimeToken);
        Bus.removeListener(EVENT.UPDATE_APP_INFO, this.loadAppInfo);
        Bus.removeListener(EVENT.CURRENT_LOG, this.updateCurrentLogToken);
        Bus.removeListener(EVENT.UPDATE_APP_INFO, this.loadTotalTimeToken);
        //Bus.removeListener(EVENT.CHECK_SYNC_STATUS, this.checkSyncStatus);
    },


    loadAppInfo: function () {
        var that = this;
        return DataAPI.getAppInfo().then(function (info) {
            that.setState(info);
        });
    },

    loadTotalTime: function () {
        var that = this;
        DataAPI.totalTime(true).then(function (totalTime) {
            that.setState({
                totalTime: totalTime
            });
        });
    },

    checkSyncStatus: function () {
        var that = this;
        return DataAPI.checkSyncStatus().then(function (unsyncDate) {
            that.setState({
                unsyncDate: unsyncDate
            });
        });
    },

    updateCurrentLog: function (log) {
        this._currentLog = log;
        this.renderLog(log);
        if (!log && this._doingLog) {
            this.renderLog(this._doingLog);
        }
    },

    renderLog: function (log) {
        var contaner = this.refs.logContent.getDOMNode(),
            content;
        if (log) {
            var lastSeconds = new Moment().diff(new Moment(log.start), 'second');
            var task = log.task,
                project = log.projects[0],
                version = log.version,
                subTask = log.subTask,
                tags = log.tags;
            content = (
                <div className="ltt_c-lastTime">
                    <span className="ltt_c-lastTime-name">
                        {this.renderSigns(log.signs)}
                        {!_.isEmpty(tags) ? tags.map(function(tag) { return <Tag>{tag}</Tag>; }) :null}
                        {project ? <span className="item project" onClick={this.openProject.bind(this, project)}>{project.name}{this.renderLink(project)}</span> : null}
                        {version ? <span className="item version" onClick={this.openVersion.bind(this, version)}>{version.name}{this.renderLink(version)}</span> : null}
                        {task ? <span className="item task" onClick={this.openTask.bind(this, task)}>{task.name}{this.renderLink(task)}</span> : null}
                        {subTask ? <span className="item task" onClick={this.openTask.bind(this, task)}>{subTask.name}{this.renderLink(subTask)}</span> : null}
                        {log.len ? Moment.duration(log.len, "minutes").format("M[m],d[d],h[h],mm[min]") : null}
                    </span>
                </div>
            );
        } else {
            content = <i></i>;
        }
        React.render(content, contaner);
    },

    renderLink: function (obj) {
        var link;
        if (obj && obj.attributes && (link = obj.attributes.link)) {
            return <span className="extenal-link" onClick={this.openExternalLink.bind(this, link)} title={link}><i className="fa fa-external-link"></i></span>
        }
        return null;
    },

    openExternalLink: function (link, e) {
        e.stopPropagation();
        Ltt.openExternalLink(link);
    },

    renderSigns: function (signs) {
        if (!_.isEmpty(signs)) {
            return signs.map(function (sign) {
                if (sign === 'wake') {
                    return <span className="item"><i className="fa fa-sun-o"></i></span>;
                }
                return null;
            });
        }
    },

    updateLastTime: function (doingLog) {
        var that = this;
        var lastTime = this.refs.lastTime.getDOMNode();
        if (this.updateTimeIntervalId !== null) {
            this.clearInterval(this.updateTimeIntervalId);
            this.updateTimeIntervalId = null;
        }
        this._doingLog = doingLog;
        if (!doingLog) {return tickTime(doingLog);}
        if (!this._currentLog) {
            this.renderLog(doingLog);
        }
        tickTime(doingLog);
        this.updateTimeIntervalId = this.setInterval(function () {
            tickTime(doingLog);
            that._notify(doingLog);
        }, 1000);

        function tickTime(doingLog) {
            var content, name;
            if (doingLog) {
                var lastSeconds = new Moment().diff(new Moment(doingLog.start), 'second');
                content = (
                    <div className="ltt_c-lastTime">
                        <i className="fa fa-clock-o"/>
                        <span className="ltt_c-lastTime-time">{numeral(lastSeconds).format('00:00:00')}</span>
                    </div>
                );
            } else {
                content = <i/>;
            }
            React.render(content, lastTime);
        }
    },

    _notify: function (doingLog) {
        if (this.__lttStopNotify) {return;}
        var that = this;
        var start = new Moment(doingLog.start);
        var notifyId = start.unix();
        var logClasses = config.classes;
        var notifyInfo = that.notifyInfo;
        //check if this doing log is notify before
        if (notifyInfo && notifyInfo.id !== notifyId) {
            that.notifyInfo = notifyInfo = null;
        }

        var lastMinutes = new Moment().diff(start, 'minute');
        var needNotify = true;
        //remind again after first remind
        if (notifyInfo && notifyInfo.count < 2) {
            if (notifyInfo.count < 2) {
                var prevNotifyMoment = notifyInfo.time;
                needNotify = prevNotifyMoment ? new Moment().diff(prevNotifyMoment, 'minute') > 2 : true;
            } else {
                needNotify = false;
            }
        }
        if (lastMinutes > 45 && needNotify) {
            var message = '',
                task = doingLog.task,
                project = doingLog.projects[0],
                subTask = doingLog.subTask,
                tag = (doingLog.tags || []).join(',');
            if (tag) {
                message = '[' + tag + '] ';
            }
            if (project) {
                message = project.name
            }
            if (task) {
                message += ' ' + task.name;
            }
            if (subTask) {
                message += ' ' + subTask.name;
            }
            var subtitle = 'Break for a while?';
            if (notifyInfo) {
                var count = notifyInfo.count;
                if (count === 1) {
                    subtitle = 'come on! stop work!';
                }
            }
            var logClass = doingLog.classes[0];
            var logClassConfig = logClasses.filter(function (cls) { return cls._id === logClass; })[0];
            var logClassLabel = logClassConfig ? logClassConfig.name : logClass || "unknow";
            Util.notify({
                title: 'spent' + Util.displayTime(lastMinutes) + ' in ' + logClassLabel,
                subtitle: subtitle,
                icon: path.join(__dirname, './images/me.jpg'),
                sound: true,
                wait: false,
                message: message
            }, {
                click: function () {
                    console.log('click');
                }
            });
            if (!notifyInfo) {
                that.notifyInfo = {
                    time: new Moment(),
                    count: 1,
                    id: notifyId
                }
            } else {
                notifyInfo.count++;
                notifyInfo.time = new Moment();
            }
        }

    },

    _stopNotify: function () {
        this.__lttStopNotify__ = true;
    },

    openProject: function (project) {
        var that = this;
        DataAPI.Project.load({name: project.name})
            .then(function (projects) {
                var project = projects[0];
                if (project) {
                    that.transitionTo('/projects/' + project._id);
                }
            });
    },

    openTask: function (task) {
        var that = this;
        DataAPI.Task.load({name: task.name})
            .then(function (tasks) {
                var task = tasks[0];
                MemStore.set(GlobalConstants.STORE_PROJECT_INDEX_TASK_ID, task);
                that.transitionTo(Util.getTaskUrl(task));
            });
    },

    openVersion: function (version) {
        var that = this;
        DataAPI.Version.load({name: version.name})
            .then(function (versions) {
                var version = versions[0];
                that.transitionTo(Util.getVersionUrl(version));
            });
    },

    updateProcessInfo: function (info) {
        var appProcessInfo = this.refs.appProcessInfo;
        this.displayAppProcessInfo(!!info, function () {
            appProcessInfo.updateInfo(info);
        });
    },

    displayAppProcessInfo: function (display, cb) {
        if (this.__processInfoDisplay === display) {
            return cb();
        }
        var that = this;
        var $stat = $('.ltt_c-appInfo-stat');
        var appProcessInfo = that.refs.appProcessInfo;
        var $appProcessInfo = $(appProcessInfo.getDOMNode());
        if (display) {
            $stat.removeClass('fadeIn').addClass('fadeOut');
        } else {
            $appProcessInfo.removeClass('fadeIn').addClass('fadeOut');
        }
        var timer = setTimeout(function () {
            if (display) {
                that.__processInfoDisplay = true;
                $appProcessInfo.removeClass('fadeOut').addClass('fadeIn');
            } else {
                that.__processInfoDisplay = false;
                $stat.removeClass('fadeOut').addClass('fadeIn');
            }
            clearTimeout(timer);
            cb();
        }, 330);
    }
});


var AppProcessInfo = React.createClass({

    getInitialState: function () {
        return {
            info: ''
        };
    },

    render: function () {
        return <div className="ltt_c-AppProcessInfo animated">{this.state.info}</div>
    },

    updateInfo: function (info) {
        this.setState({
            info: info
        });
    }
});


var NotifyCenter = function () {
    this.messageQueue = [];
};


NotifyCenter.prototype = {
    constructor: NotifyCenter,
    notify: function (msg, options) {

    }
}

module.exports = App;