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

/** Components */
var Header = require('./components/Header');
var Nav = require('./components/Nav');
var PureRenderMixin = require('react/addons').addons.PureRenderMixin;
/* Const */
var NAV_OPEN = 'ltt__navOpen';
var EVENT = require('./constants/EventConstant');

/** Utils */
var DataAPI = require('./utils/DataAPI');
var Bus = require('./utils/Bus');



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
        clsObj[NAV_OPEN] = this.state.openNav;
        var className = cx(clsObj);
        return (
            <div className={className}>
                <Header
                    isFullscreen={this.state.isFullscreen}
                    onConfigBtnClick={this.toggleNav}
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

    toggleNav: function () {
        this.setState({
            openNav: !this.state.openNav
        });
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

    mixins: [SetIntervalMixin],

    getInitialState: function () {
        return {
            projectCount: 0,
            unsyncDate: []
        };
    },

    render: function () {
        return (
            <footer className="ltt-footer">
                <div className="btn-group">
                    <button className="btn btn-xs"><i className="fa fa-plus"></i></button>
                </div>
                <div className="lastTime" ref="lastTime"></div>
                <div className="ltt_c-appInfo">
                    {this.renderUnSyncInfo()}
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
        Bus.addListener(EVENT.DOING_LOG, this.updateLastTimeToken);
        Bus.addListener(EVENT.UPDATE_APP_INFO, this.loadAppInfo);
        Bus.addListener(EVENT.CHECK_SYNC_STATUS, this.checkSyncStatus);
    },

    componentDidMount: function () {
        var that = this;
        this.loadAppInfo();
        this.checkSyncStatus();
    },

    componentWillUnmount: function () {
        Bus.removeListener(EVENT.DOING_LOG, this.updateLastTimeToken);
        Bus.removeListener(EVENT.UPDATE_APP_INFO, this.loadAppInfo);
        Bus.removeListener(EVENT.CHECK_SYNC_STATUS, this.checkSyncStatus);
    },

    loadAppInfo: function () {
        var that = this;
        console.log('load app info');
        return DataAPI.getAppInfo().then(function (info) {
            that.setState(info);
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


    updateLastTime: function (doingLog) {
        var that = this;
        var lastTime = this.refs.lastTime.getDOMNode();
        if (this.updateTimeIntervalId) {
            this.clearInterval(this.updateTimeIntervalId);
        }
        if (!doingLog) {return tickTime(doingLog);}
        var start = new Moment(doingLog.start);
        var notifyId = start.unix();
        tickTime(doingLog);
        this.updateTimeIntervalId = this.setInterval(function () {
            var notifyInfo = that.notifyInfo;
            //check if this doing log is notify before
            if (notifyInfo && notifyInfo.id !== notifyId) {
                console.log('new');
                that.notifyInfo = notifyInfo = null;
            }
            tickTime(doingLog);
            var prevNotifyMoment = notifyInfo ? notifyInfo.time : null;
            var lastMinutes = new Moment().diff(start, 'minute');
            //remind again after first remind
            var needNotify = prevNotifyMoment ? new Moment().diff(prevNotifyMoment, 'minute') > 15 : true;
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
                Ltt.sdk.notify({
                    title: '😁' + '你已经工作了' + start.fromNow(true),
                    subtitle: '可以休息一下啦',
                    icon: path.join(__dirname, './images/me.jpg'),
                    sound: true,
                    wait: false,
                    message: message
                }, {
                    click: function () {
                        alert('test');
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
        }, 1000);

        function tickTime(doingLog) {
            var content, name;
            if (doingLog) {
                var lastSeconds = new Moment().diff(new Moment(doingLog.start), 'second');
                var task = doingLog.task,
                    project = doingLog.projects[0],
                    subTask = doingLog.subTask,
                    tag = (doingLog.tags || []).join(',');
                if (tag) {
                    name = '[' + tag + '] ';
                }
                if (project) {
                    name = project.name
                }
                if (task) {
                    name += ' ' + task.name;
                }
                if (subTask) {
                    name += ' ' + subTask.name;
                }
                content = (
                    <div className="ltt_c-lastTime">
                        <i className="fa fa-clock-o"/>
                        <span className="ltt_c-lastTime-name">
                            {name}
                        </span>
                        <span className="ltt_c-lastTime-time">{numeral(lastSeconds).format('00:00:00')}</span>
                    </div>
                );
            } else {
                content = <i></i>;
            }
            React.renderComponent(content, lastTime);
        }
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