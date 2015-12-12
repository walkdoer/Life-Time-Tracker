'use strict';
var React = require('react');
var cx = React.addons.classSet;
var Router = require('react-router');
var _ = require('lodash');
var Q = require('q');
var RB = require('react-bootstrap');
var Button = RB.Button;
var ButtonToolbar = RB.ButtonToolbar;
var DropdownButton = RB.DropdownButton;
var OverlayTrigger = RB.OverlayTrigger;
var TabbedArea = RB.TabbedArea;
var TabPane = RB.TabPane;
var Link = RB.Link;
var Popover = RB.Popover;
var MenuItem = RB.MenuItem;
var Moment = require('moment');
var Color = require('color');
var TrackerHelper = require('tracker/helper');
var SlidePanel = require('../SlidePanel');
var Scroller = require('../Scroller');
var mui = require('material-ui');
var DefaultRawTheme = require('material-ui/lib/styles/raw-themes/light-raw-theme');
var md5 = require('blueimp-md5').md5;



/**Components*/
var TodayReport = require('../../reports/TodayReport');
var HelpDocument= require('../HelpDocument');
var Progress = require('../Progress');

//store key
var SK_CONTENT = 'content';
var Ltt = global.Ltt;
var Notify = require('../Notify');
var Mt = window.Mousetrap;
var NProgress = require('nprogress');
var NO_SYNC = 1, SYNCING = 2, SYNC_ERROR = 3;
var Range = ace.require('ace/range').Range;
var ThemeManager = require('material-ui/lib/styles/theme-manager');
/** constant */
var EventConstant = require('../../constants/EventConstant');
var EVENT_HIGHLIGHT_CLASS = 'event-highlight';
var NotEmpty = function(a) {return !!a};
var LOG_NOT_VALID = 'log_not_valid';
var noop = function () {};

/**util*/
var DataAPI = require('../../utils/DataAPI');
var Bus = require('../../utils/Bus');
var Util = require('../../utils/Util');

/** config */
var config = require('../../conf/config');

var progressTpl = _.template('<%=progress%>%');

var _insertLog = null;
Bus.on(EventConstant.INSERT_LOG_FROM_TASK, function (log) {
    _insertLog = log;
});


/** cache */
var contentCache = {};
var __starLines = {};

//window.contentCache = contentCache;
var LogEditor = React.createClass({

    childContextTypes: {
        muiTheme: React.PropTypes.object
    },

    getChildContext: function() {
        return {
            muiTheme: ThemeManager.getMuiTheme(DefaultRawTheme)
        };
    },

    getDefaultProps: function () {
        return {
            onLoad: function () {},
            onChange: function () {},
            onSave: function () {},
            onLineChange: function () {}
        };
    },

    getInitialState: function () {
        return {
            syncStatus: NO_SYNC,
            highlightUnFinishLog: false,
            showCalendar: false
        };
    },

    _trackActicity: function () {
        var todayDate = new Moment().format('YYYY-MM-DD');
        if (this.props.title !== todayDate) {
            return;
        }
        this.__lastNotifyTime = {};
        function notify (log) {
            var start = new Moment(log.estimateStart);
            var end = new Moment(log.estimateEnd);
            Util.notify({
                title: 'will start in ' + start.fromNow() + ' at ' + start.format('HH:mm'),
                subtitle: 'time: ' + Moment.duration(end.diff(start, 'minute'), 'minutes').format("M[m],d[d],h[h],mm[min]") + ' end at:' + end.format('HH:mm'),
                message: Util.getLogDesc(log)
            });
        }
        function notifyEndSoon(log, useTime, remainTime) {
            Util.notify({
                title: 'Will End in ' + Util.displayTime(remainTime),
                subtitle: 'already use ' + Util.displayTime(useTime),
                message: Util.getLogDesc(log)
            });
        }
        this.__timeCheckerInterval = setInterval(function () {
            var mNow = new Moment();
            var logs = this.getAllLogs(true);
            var lines = this.getAllLines();
            var NOTIFY_THRESHOLD = 10,
                NOTIFY_INTERVAL = 5;
            var md5Id;
            this._updateLogThatShouldBeginSoon(logs);
            this._updateOverdueLogs(logs, lines);
            logs.forEach(function (log) {
                var mEstimateStart, mEstimateEnd;
                var estimatedTime = getEstimateTime(log);
                if (estimatedTime > 0 && Util.isDoingLog(log)) {
                    md5Id = md5(log.origin) + '-end';
                    var fromStart = mNow.diff(log.start, 'minute');
                    var threshold = Math.ceil(estimatedTime * 0.7);
                    var remainTime = estimatedTime - fromStart
                    if (fromStart > threshold && remainTime > 0 && !this.__lastNotifyTime[md5Id]) {
                        notifyEndSoon(log, fromStart, remainTime);
                        this.__lastNotifyTime[md5Id] = true;
                    }
                }
                if (log.estimateStart && !log.start) {
                    md5Id = md5(log.origin);
                    mEstimateStart = new Moment(log.estimateStart);
                    var diff = mEstimateStart.diff(mNow, 'minute');
                    if (diff <= NOTIFY_THRESHOLD && diff >= 0) {
                        if (!this.__lastNotifyTime[md5Id]) {
                            notify(log);
                            this.__lastNotifyTime[md5Id] = true;
                        }
                        //notify
                    } else if (diff < 0){
                        delete this.__lastNotifyTime[md5Id];
                    }
                }
            }.bind(this));
        }.bind(this), 5000);
    },

    _updateOverdueLogs: function (logs, lines) {
        var mNow = new Moment();
        if (!lines) {
            lines = this.getAllLines();
        }
        logs.forEach(function (log) {
            var mEstimateStart, mEstimateEnd;
            var estimatedTime = log.estimatedTime;
            if (!estimatedTime) {
                if (log.estimateStart && log.estimateEnd) {
                    estimatedTime = new Moment(log.estimateEnd).diff(log.estimateStart, 'minute');
                }
            }
            var index = lines.indexOf(log.origin);
            this.unhighlightLine(index, 'log-overdue');
            if (estimatedTime > 0 && Util.isDoingLog(log)) {
                var fromStart = mNow.diff(log.start, 'minute');
                var overdue = fromStart > estimatedTime;
                if (overdue) {
                    this.highlightLine(index, 'log-overdue');
                }
            }
        }, this);
    },

    _unTrackActivity: function () {
        clearInterval(this.__timeCheckerInterval);
        this.__timeCheckerInterval = null;
        this.__lastNotifyTime = null;
    },

    render: function () {
        var start = new Date().getTime();
        var syncIcon = 'fa ';
        NProgress.configure({parent: '.ltt_c-logEditor', showSpinner: false});
        var syncStatus = this.state.syncStatus;
        if (syncStatus === SYNCING) {
            syncIcon += 'fa-refresh fa-spin';
        } else if (syncStatus === NO_SYNC){
            syncIcon += 'fa-upload';
        } else if (syncStatus === SYNC_ERROR) {
            syncIcon += 'fa-exclamation-circle';
        }
        var menuItems = [
          { route: 'get-started', text: 'Get Started' },
          { route: 'customization', text: 'Customization' },
          { route: 'components', text: 'Components' }
        ];
        return (
            <div className="ltt_c-logEditor">
                <div className="ltt_c-logEditor-header">
                    <div className="ltt_c-logEditor-header-left">
                        <span className="ltt_c-logEditor-header-toggleCalendar"
                            onClick={this.toggleCalendar}>
                            <i className="fa fa-calendar"></i>
                        </span>
                        <span className="ltt_c-logEditor-title">
                            {this.props.title}
                            <i ref="changeFlag" className="fa changeFlag fa-asterisk"/>
                        </span>
                    </div>
                    <div className="ltt_c-logEditor-header-middle">
                        <Accomplishment date={this.props.title} ref="accomplishment"/>
                    </div>
                    <div className="ltt_c-logEditor-header-right">
                        <ButtonToolbar>
                            <Button onClick={this.toggleHighlightUnFinishLog} bsSize='small' title='show unfinish log' active={this.state.highlightUnFinishLog}><i className="fa fa-magic"></i></Button>
                            <Button onClick={this.openReport} bsSize='small' title="open report"><i className="fa fa-line-chart"/></Button>
                            <Button onClick={this.sortLogs} bsSize='small' title="sort logs"><i className="fa fa-sort-alpha-asc"></i></Button>
                            <Button onClick={this.openHelpDoc} bsSize='small' title="open help document"><i className="fa fa-book"></i></Button>
                            <DropdownButton bsSize='small' title='Copy' onSelect={this.copyTaskFromPast}>
                                <MenuItem eventKey='today'>today</MenuItem>
                                <MenuItem eventKey='yesterday'>yesterday</MenuItem>
                                <MenuItem eventKey='week'>this week</MenuItem>
                                <MenuItem eventKey='week'>this month</MenuItem>
                                <MenuItem divider />
                                <MenuItem eventKey='last_3_days'>last three days</MenuItem>
                                <MenuItem eventKey='last_7_days'>last seven days</MenuItem>
                                <MenuItem eventKey='last_15_days'>last fifeen days</MenuItem>
                                <MenuItem eventKey='last_month'>last month</MenuItem>
                             </DropdownButton>
                        </ButtonToolbar>
                    </div>
                </div>
                <LogProgress ref="logProgress"/>
                <div className="ltt_c-logEditor-content">
                    {this.state.showCalendar ? <Calendar date={this.props.title} onEventClick={this.onCalendarEventClick} ref="calendar"/> : null }
                    <pre id="ltt-logEditor" ref="editor"></pre>
                    <SlidePanel className="todayReport" ref="todayReport" open={false} onTransitionEnd={this.renderTodayReport}>
                        <div ref="reportContainer" style={{height: "100%"}}>
                        </div>
                    </SlidePanel>
                    <SlidePanel className="helpDoc" ref="helpDoc" open={false} style={{padding: 20}}>
                        <TabbedArea>
                            <TabPane eventKey="shortcut" tab="Shortcuts">
                                <HelpDocument src="./help/editor.shortcuts.md"/>
                            </TabPane>
                            <TabPane eventKey="logExample" tab="Log Example">
                                <HelpDocument src="./help/editor.logExample.md"/>
                            </TabPane>
                        </TabbedArea>
                    </SlidePanel>
                </div>
            </div>
        );
    },

    componentDidMount: function () {
        var start, end;
        var that = this;
        var editor = this._initEditor();
        var title = this.props.title;

        this.readLog(title).then(function (content) {
            var cacheContent = that._recoveryFromLocalStorage();
            if (cacheContent) {
                console.info('recover ' + title + ' from localStorage');
                content = cacheContent;
                that.writeLog(title, content).then(function (result) {
                    if (!result.success) {
                        Notify.error('Recovery from cache failed');
                    } else {
                        Notify.success('Recovery ' + title + ' from cache');
                        that._removeFromLocalStorage();
                    }
                }).catch(function(err) {
                    Notify.error('Recovery from cache failed');
                });
            }
            that.setValue(content);
            that._highLightDoingLine(content);
            that._updateLogThatShouldBeginSoon();
            that.gotoDoingLogLine(content);
            that._gotoLocate(that.props.locate, content);
            that._starCacheLines();
            that._checkLogValid(content);
            that._updateLogProgress();
            that._annotationOverTimeLog(that.getAllLogs(), content);
            that.props.onLoad(content, that.getDoingLog(content));
            editor.focus();
            if (_insertLog) {
                that.insertLogToLastLine(_insertLog.origin);
                _insertLog = null;
            }
            that._listenToEditor();
            that._activeCurrentLine();
        }).fail(function (err) {
            console.error(err);
            console.error(err.stack);
        });
    },

    _gotoLocate: function (locate, content, time) {
        if (!locate) { return; }
        var session = this.editor.getSession();
        var row = null;
        content.split('\n').some(function (log, index) {
            if (log === locate) {
                row = index;
            }
        });
        if (row !== null) {
            this.gotoLine(row + 1, 0);
            var range = new Range(row, 0, row, Infinity);
            var marker = session.addMarker(range, "ace_step", "fullLine");
            var timer = setTimeout(function () {
                clearTimeout(timer);
                timer = null;
                session.removeMarker(marker);
            }, time || 10000);
        }
    },

    _initEditor: function () {
        var that = this;
        var editor = ace.edit("ltt-logEditor");
        this.editor = editor;
        this._highlightMaker = {};
        editor.setTheme("ace/theme/github");
        //editor.renderer.setShowGutter(false); //hide the linenumbers
        var session = editor.getSession();
        session.setMode("ace/mode/ltt");
        session.setUseWrapMode(true);
        var langTools = ace.require("ace/ext/language_tools");
        langTools.resetCompleters();
        var title = this.props.title;
        console.info('init editor');
        if (_.isEmpty(__starLines[title])) {
            __starLines[title] = [];
        }
        editor.setOptions({
            enableSnippets: false,
            enableBasicAutocompletion: true,
            enableLiveAutocompletion: false
        });
        // uses http://rhymebrain.com/api.html
        var logCompleter = {
            getCompletions: function(editor, session, pos, prefix, callback) {
                var token = session.getTokenAt(pos.row, pos.column);
                var line = session.getLine(pos.row);
                var tokenType = token.type;
                var tokenValue = token.value;
                console.info('tokenValue:' + tokenValue + ' prefix:' + prefix);
                if (tokenType === 'text') {
                    if (tokenValue === '<') {
                        that.getProjectCompletions(line, callback);
                    } else if (tokenValue === '$') {
                        that.getVersionCompletions(line, callback);
                    } else if (tokenValue === '(') {
                        that.getTaskCompletions(line, callback);
                    } else if (tokenValue === '$') {
                        that.getTaskCompletions(line, callback);
                    }
                } else if (tokenType === 'ltt_version'){
                    that.getVersionCompletions(line, callback);
                } else if (tokenType === 'ltt_project') {
                    that.getProjectCompletions(line, callback);
                } else if (tokenType === 'ltt_task') {
                    that.getTaskCompletions(line, callback);
                } else if (tokenType === 'ltt_subTask') {
                    that.getTaskCompletions(line, callback);
                } else if (tokenType === 'ltt_tag') {
                    that.getTagCompletions(prefix, callback);
                }
            }
        }
        langTools.addCompleter(logCompleter);
        //editor.setBehavioursEnabled(true);
        //content = editorStore(SK_CONTENT);
        //this._initProjectTypeahead();
        this._initEditorCommand();
        this._trackActicity();
        return editor;
    },

    _addColorToEditorGutter: function () {
        var lines = this.getAllLines();
        var colorMap = {};
        config.classes.forEach(function (cls) {
            colorMap[cls._id] = cls.color;
        });
        var $gutters = $(this.refs.editor.getDOMNode()).find('.ace_gutter-cell');

        lines.forEach(function (log, index) {
            if (!log) {return;}
            var logObj = this.toLogObject(log)[0];
            if (logObj && logObj.classes) {
                var cls = logObj.classes[0];
                if (cls) {
                    $gutters.eq(index).css({
                        'background-color': colorMap[cls],
                        'color': '#FFF'
                    });
                }
            }
        }, this);
    },


    getUnfinishLog: function (start, end) {
        var that = this;
        return DataAPI.Log.load({
            start: start,
            end: end,
            group: 'task',
            sort: 'start:1'
        }).then(function (result) {
            var unfinishLog = [];
            result.forEach(function (task) {
                var logs = task.logs;
                if (!task._id) {return;}
                if (!_.isEmpty (logs)) {
                    var lastLog = logs[logs.length - 1];
                    var progress = lastLog.progress;
                    if (
                        progress && isDoing(progress)
                    ) {
                        unfinishLog.push(lastLog);
                    }
                }
            });

            function isDoing(progress) {
                var sequence = ['project', 'version', 'task', 'subTask'].map(function (type) {
                    return progress[type];
                }).filter(function (num) { return _.isNumber(num);})
                var lastProgress = _.last(sequence);
                return lastProgress >= 0 && lastProgress < 100;
            }
            return unfinishLog;
        });
    },

    copyTaskFromPast: function (period) {
        var that = this;
        var dateParams = Util.toDate(period);
        this.getUnfinishLog(dateParams.start, dateParams.end).then(function (unfinishLogs) {
            that.insertLogToLastLine(unfinishLogs.map(function (log) {
                return log.origin;
            }).join('\n'));
        }).catch(function (err) {
            console.err(err.stack);
            Notify.error('Insert Yesterday\'s task failed');
        });
    },

    insertLogToLastLine: function (log) {
        var session = this.editor.getSession();
        if (log) {
            var line = session.getLength();
            log = log.replace(/\d{1,2}\s*[:]\s*\d{1,2}\s*(\s*[~～-]\s*\d{1,2}\s*[:]\s*\d{1,2})*/ig, '').trim();
            session.insert({row: line + 1, column: 0}, '\n' + log);
            this.gotoLine(line + 1, log.length);
        }
    },

    insertLogToLastValidLogLine: function (log) {
        var editor = this.editor;
        var session = editor.getSession()
        var allLines = session.getDocument().getAllLines();
        var index = 0;
        for (var i = 0; i < allLines.length; i++) {
            if (Util.isValidLog(allLines[i])) {
                index = i + 1;
            }
        }
        var newLine = index;
        if (index === allLines.length) {
            log = '\n' + log;
        }
        if (allLines[index - 1]) {
            log += '\n';
        }
        session.insert({row: newLine, column: 0}, log);
        return newLine;
    },

    getLastValidLog: function () {
        var editor = this.editor;
        var session = editor.getSession()
        var allLines = session.getDocument().getAllLines();
        var index = null;
        var log = null;
        for (var i = 0; i < allLines.length; i++) {
            if (Util.isValidLog(allLines[i])) {
                index = i + 1;
                log = allLines[i];
            }
        }
        return {
            index: index,
            log: log
        };
    },


    _destroyEditor: function () {
        console.info('Destroy editor start');
        if (this.editor) {
            this.editor.destroy();
            this._highlightMaker = {};
            this._highlightUnFinishLogIndex = null;
            this.__beginSoonHighlight = null;
            this._currentRow = null;
            this.refs.editor.getDOMNode().innerHTML = '';
            this.editor = null;
            console.info('Destroy editor end');
        }
        this._unTrackActivity();
    },

    _saveWorkBeforeDestroy: function () {
        var that = this;
        if (this.isContentChange()) {
            var val = that.editor.getValue();
            return that.save(val, true);
        } else {
            return Q();
        }
    },

    _initEditorCommand: function () {
        var that = this;
        var editor = this.editor;
        var commands = editor.commands;
        commands.addCommand({
            name: "import",
            bindKey: {win: "Ctrl-S", mac: "Command-S"},
            exec: function(editor) {
                that.save(editor.getValue()).then(function () {
                    var calendar = that.refs.calendar;
                    if (calendar) {
                        calendar.refetch();
                    }
                });
            }
        });

        commands.addCommand({
            name: 'nextDay',
            bindKey: {win: 'Ctrl-]', mac: 'Command-]'},
            exec: function (editor) {
                that.props.onNextDay(editor);
            }
        });

        commands.addCommand({
            name: 'prevDay',
            bindKey: {win: 'Ctrl-[', mac: 'Command-['},
            exec: function (editor) {
                that.props.onPrevDay(editor);
            }
        });

        commands.addCommand({
            name: 'gotoDoingLog',
            bindKey: {win: 'Ctrl-/', mac: 'Command-/'},
            exec: function (editor) {
                that.gotoDoingLogLine(editor.getValue());
            }
        });

        commands.addCommand({
            name: 'gotoToday',
            bindKey: {win: 'Ctrl-\\', mac: 'Command-\\'},
            exec: function (editor) {
                that.props.onGotoToday(editor);
            }
        });

        commands.addCommand({
            name: 'onCtrlO',
            bindKey: {win: 'Ctrl-o', mac: 'Command-o'},
            exec: function (editor) {
                that.props.onCtrlO(editor);
            }
        });

        commands.addCommand({
            name: 'startNewLog',
            bindKey: {win: 'Ctrl-i', mac: 'Command-i'},
            exec: function (editor) {
                var log = new Moment().format('HH:mm') + '~';
                var line = that.insertLogToLastValidLogLine(log);
                that.gotoLine(line + 1, log.length);
            }
        });

        commands.addCommand({
            name: 'insertCurrentTime',
            bindKey: {win: 'Ctrl-t', mac: 'Command-t'},
            exec: function (editor) {
                editor.insert(new Moment().format('HH:mm'));
            }
        });


        commands.addCommand({
            name: 'beginActivity',
            bindKey: {win: 'Ctrl-b', mac: 'Command-b'},
            exec: function (editor) {
                var session = editor.getSession();
                var doc = session.getDocument();
                var validLog = that.getLastValidLog();
                var timeStr = new Moment().format('HH:mm') + '~';
                var pos = editor.getCursorPosition();
                var line = session.getLine(pos.row);
                var row;
                if (!line || Util.isValidLog(line)) {
                    line = that.getFirstPlanLog();
                    row = that.getLineIndex(line);
                } else {
                    row = pos.row;
                }
                if (!line) { return; }
                var newIndex = validLog.index;
                if (newIndex === null) {
                    newIndex = 0;
                }
                that.finishCurrentActivity();
                //move line
                var range = new Range(row, 0, row, Infinity);
                session.moveText(range, {row: newIndex, column: 0});
                var pos = {row: newIndex, column: line.length};
                if (session.getLine(newIndex).trim() !== '') {
                    session.insert(pos, '\n');
                }
                //insert time
                session.insert({row: newIndex, column: 0}, timeStr);
                that.gotoLine(newIndex + 1, timeStr.length);
            }
        });


        commands.addCommand({
            name: 'updateEndTime',
            bindKey: {win: 'Ctrl-Shift-E', mac: 'Command-Shift-E'},
            exec: function () {
                var endRegexp = /\s*[~～-]\s*\d{1,2}\s*[:]\s*\d{1,2}/ig;
                var pos = editor.getCursorPosition();
                var row = pos.row;
                var line = that.getCurrentLine();
                if (line) {
                    var time = line.match(endRegexp);
                    if (time && (time = time[0])) {
                        time = time.trim().slice(1);
                        var spliterPos = line.indexOf('~');
                        var replacePos = line.indexOf(time, spliterPos)
                        if (replacePos < 0) {return;}
                        editor.session.replace(new Range(row, replacePos, row, replacePos + time.length), new Moment().format('HH:mm'))
                    }
                }
            }
        });

        commands.addCommand({
            name: 'updateBeginTime',
            bindKey: {win: 'Ctrl-shift-B', mac: 'Command-shift-B'},
            exec: function () {
                var beginRegexp = /\d{1,2}\s*[:]\s*\d{1,2}\s*[~～-]\s*/ig;
                var pos = editor.getCursorPosition();
                var row = pos.row;
                var line = that.getCurrentLine();
                if (line) {
                    var time = line.match(beginRegexp);
                    if (time && (time = time[0])) {
                        time = time.trim();
                        time = time.slice(0, time.indexOf('~'));
                        var replacePos = line.indexOf(time);
                        if (replacePos < 0) {return;}
                        editor.session.replace(new Range(row, replacePos, row, replacePos + time.length), new Moment().format('HH:mm'))
                    }
                }
            }
        });


        commands.addCommand({
            name: 'finishActivity',
            bindKey: {win: 'Ctrl-E', mac: 'Command-E'},
            exec: function (editor) {
                that.finishCurrentActivity();
            }
        });


        commands.addCommand({
            name: 'continueActivity',
            bindKey: {win: 'Ctrl-Shift-c', mac: 'Command-Shift-c'},
            exec: function (editor) {
                var session = editor.getSession();
                var doc = session.getDocument();
                var validLog = that.getLastValidLog();
                var timeStr = new Moment().format('HH:mm') + '~';
                var pos = editor.getCursorPosition();
                var line = session.getLine(pos.row);
                var newIndex = validLog.index;
                var newLine = timeStr + TrackerHelper.removeTimeString(line);
                //insert contine log
                session.insert({row: newIndex, column: 0},  newLine);
                var pos = {row: newIndex, column: newLine.length};
                session.insert(pos, '\n');
                that.gotoLine(newIndex + 1, timeStr.length);
            }
        });


        commands.addCommand({
            name: 'highlightUnFinishLog',
            bindKey: {win: 'Ctrl-U', mac: 'Command-U'},
            exec: function () {
                that.toggleHighlightUnFinishLog();
            }
        });

        _.range(9).forEach(function (val) {
            var that = this;
            var numberKey = val + 1;
            commands.addCommand({
                name: 'gotoLogByTimeConsumeOrder' + numberKey,
                bindKey: {win: 'Ctrl-' + numberKey, mac: 'Command-' + numberKey},
                exec: function () {
                    that.gotoLogByTimeConsumeOrder(val);
                }
            });
        }, that);

        commands.addCommand({
            name: 'gotoNextLog',
            bindKey: {win: 'Ctrl-alt-.', mac: 'Command-alt-.'},
            exec: function () {
                that.props.onNextLog(that.getCurrentLog());
            }
        });

        commands.addCommand({
            name: 'gotoPrevLog',
            bindKey: {win: 'Ctrl-alt-,', mac: 'Command-alt-,'},
            exec: function () {
                that.props.onPrevLog(that.getCurrentLog());
            }
        });

        commands.addCommand({
            name: 'gotoLastLog',
            bindKey: {win: 'Ctrl-shift-.', mac: 'Command-shift-.'},
            exec: function () {
                that.props.onNextLog(that.getCurrentLog(), true);
            }
        });

        commands.addCommand({
            name: 'gotoFirstLog',
            bindKey: {win: 'Ctrl-shift-,', mac: 'Command-shift-,'},
            exec: function () {
                that.props.onPrevLog(that.getCurrentLog(), true);
            }
        });

        commands.addCommand({
            name: "toggleCalendar",
            bindKey: {win: "Ctrl-K", mac: "Command-K"},
            exec: function(editor) {
                that.toggleCalendar();
            }
        });

        commands.addCommand({
            name: 'toggleStarLine',
            bindKey: {win: 'Ctrl-\'', mac: 'Command-\''},
            exec: function () {
                that.toggleStarLine();
            }
        });

    },

    finishCurrentActivity: function () {
        var editor = this.editor;
        if (this.gotoDoingLogLine(editor.getValue())) {
            editor.insert(new Moment().format('HH:mm'));
        }
    },


    getTagCompletions: function (prefix, cb) {
        var that = this;
        DataAPI.Tag.load({name: prefix}).then(function (tags) {
            if (_.isEmpty(tags)) {
                return cb(null, []);
            }
            var completions = tags.map(function (tag) {
                return {name: tag.name, value: tag.name, meta: 'tag'};
            });
            cb(null, completions);
        });
    },

    getProjectCompletions: function (line, cb) {
        //var projects = [{name: 'life-time-tracker'}, {name: 'wa'}];
        var that = this;
        DataAPI.Project.load({aggregate: false, versions: false}).then(function(projects) {
            //if not projects, then no need to create typeahead
            if (_.isEmpty(projects)) {return cb(null, [])}
            var completions = projects.map(function(proj) {
                var score = new Date(proj.lastActiveTime).getTime()
                return {name: proj.name, value: proj.name, score: score, meta: progressTpl(proj)};
            });
            cb(null, completions);
        });
    },

    getVersionCompletions: function (line, cb) {
        var that = this;
        /*return cb(null, [
            {name: '0.1.0', value: '0.1.0', score: 1, meta: "version"},
            {name: '0.1.1', value: '0.1.1', score: 2, meta: "version"},
            {name: '0.1.2', value: '0.1.2', score: 3, meta: "version"}
        ]);*/
        this._updateCurrentInfomation(line).then(function () {
            var info = that._getCurrentLogInformation();
            if (!info.projectId) { return cb(null, []); }
            return DataAPI.Version.load({projectId: info.projectId}).then(function (versions) {
                if (_.isEmpty(versions)) { return cb(null, []); }
                var completions = versions.map(function(ver) {
                    var score = new Date(ver.lastActiveTime).getTime();
                    return {
                        name: ver.name,
                        value: ver.name,
                        score: score,
                        meta: 'version'
                    };
                });
                cb(null, completions);
            });
        })
    },

    getTaskCompletions: function (line, cb) {
        var that = this;
        this._updateCurrentInfomation(line).then(function () {
            var info = that._getCurrentLogInformation();
            if (!info.projectId) { return cb(null, []); }
            return DataAPI.Task.load({projectId: info.projectId, versionId: info.versionId, populate: false, parent: info.taskId})
                .then(function (tasks) {
                    if (_.isEmpty(tasks)) { return cb(null, []); }
                    var completions = tasks.map(function(task) {
                        var score = new Date(task.lastActiveTime).getTime();
                        return {
                            name: task.name,
                            value: task.name,
                            score: score,
                            meta: progressTpl(task),
                            identifierRegex:/[a-zA-Z_0-9\u00A2-\uFFFF]/
                        }
                    });
                    cb(null, completions);
                });
        });
    },

    componentWillUnmount: function () {
        this._saveWorkBeforeDestroy();
        this._removeFromLocalStorage();
        this._destroyEditor();
    },

    _listenToEditor: function () {
        var that = this;
        var editor = this.editor;
        var session = editor.getSession();
        var selection = editor.getSelection();
        session.on('change', _.debounce(function (e) {
            var title = that.props.title; //title can not be outside of this function scope,make sure that the title is the lastest.
            var content = session.getValue();
            contentCache[title] = content;
            var logs = TrackerHelper.getLogs(content, title);
            //persist to localstorage, if app exit accidently, can recovery from localstorage
            that._persistToLocalStorage(title, content);
            that._highLightDoingLine(content);
            that._updateLogProgress();
            that._updateOverdueLogs(logs);
            that._updateLogThatShouldBeginSoon();
            that._annotationOverTimeLog(logs, content);
            that._showContentChangeFlag();
            if (that.state.highlightUnFinishLog) {
                that.unhighlightUnFinishLog();
                that.highlightUnFinishLog();
            }
            that._updateHighlightStarLine();
            that.props.onChange(content, editor);
        }, 150));

        selection.on('changeCursor', _.debounce(function (e, selection) {
            var row = selection.getCursor().row;
            if (row !== that._currentRow) {
                var line = session.getLine(row), log;
                if (line) {
                    log = that.toLogObject(line)[0];
                }
                that.allocateLogInCalendar(log);
                that.props.onLineChange(line, log);
                that._currentRow = row;
            }
        }, 200));
    },

    getCurrentLineIndex: function () {
        var selection = this.editor.getSelection();
        var session = this.editor.getSession();
        return selection.getCursor().row;
    },

    getCurrentLine: function () {
        var selection = this.editor.getSelection();
        var session = this.editor.getSession();
        return session.getLine(selection.getCursor().row);
    },

    _showContentChangeFlag: function () {
        var node = this.refs.changeFlag.getDOMNode();
        if (!node.classList.contains('changed')) {
            node.classList.add('changed');
        }
    },

    _hideContentChangeFlag: function () {
        var node = this.refs.changeFlag.getDOMNode();
        node.classList.remove('changed');
    },

    getCurrentLog: function () {
        var line = this.getCurrentLine();
        var log = null;
        if (line) {
            var logs = this.getAllLogs(true);
            logs.some(function (logItem) {
                if (logItem.origin === line) {
                    log = logItem;
                }
            });
        }
        return log;
    },

    _detachListenToEditor: function () {
        var session = this.editor.getSession();
        session.removeAllListeners('change');
    },

    _highLightDoingLine: function (content) {
        var editor = this.editor;
        var session = this.editor.getSession();
        var doingLog = this.getDoingLog(content);
        var range, marker;
        var index = this.getDoingLogIndex(doingLog, content);
        if (_.isNumber(index)) {
            if (this._doingLogIndex !== index) {
                removeHighlight(this._doingLogMarker);
                this._doingLogIndex = index;
                this._doingLogMarker = highlight(index);
            } else if (!this._doingLogMarker) {
                this._doingLogMarker = highlight(index);
            }
        } else {
            removeHighlight(this._doingLogMarker);
            this._doingLogMarker = null;
        }
        return index;

        function highlight(index) {
            var range = new Range(index, 0, index, Infinity);
            var marker = session.addMarker(range, "ace_step", "fullLine");
            return marker;
        }

        function removeHighlight(marker) {
            if (marker) {
                session.removeMarker(marker);
            }
        }

    },

    _annotationOverTimeLog: function (logs, content) {
        var overtimeLogs = this._getOverTimeLog(logs);
        var annotations = overtimeLogs.map(function (log) {
            var realTime = log.len;
            var estimatedTime = getEstimateTime(log);
            var overRate = ((realTime - estimatedTime) / estimatedTime) * 100;
            return {
                row: this.getLineIndex(log.origin, content), // must be 0 based
                column: 0,  // must be 0 based
                text: 'overtime ' + overRate.toFixed(1) + '% (' + displayTime(realTime) + '/' + displayTime(estimatedTime) + ')',
                type: "warning"
            }
        }, this);
        this.editor.getSession().setAnnotations(annotations)
    },


    _getOverTimeLog: function (logs) {
        if (!logs) {return [];}
        return logs.filter(function (log) {
            var estimateTime = getEstimateTime(log);
            return  estimateTime && log.len > estimateTime;
        });
    },

    getDoingLogIndex: function (doingLog, content) {
        if (!content) {
            content = this.editor.getValue();
        }
        if (!doingLog) {
            doingLog = this.getDoingLog(content);
        }
        var index;
        if (doingLog) {
            index = this.getLineIndex(doingLog.origin, content);
        }
        return index;
    },

    getLine: function (lineIndex) {
        return this.editor.getSession().getLine(lineIndex);
    },

    getLineIndex: function (line, content) {
        var index;
        if (!content) {
            content = this.editor.getSession().getValue();
        }
        var lines = content.split('\n');
        for (var i = 0; i < lines.length; i++) {
            if (lines[i] === line) {
                index = i;
                break;
            }
        }
        return index;
    },


    _initShortcut: function () {
        var that = this;
        Mt.bind('esc', function (e) {
        });
    },


    shouldComponentUpdate: function (nextProps, nextState) {
        var title = this.props.title;
        var result = title !== nextProps.title ||
            this.state.syncStatus !== nextState.syncStatus ||
            this.state.highlightUnFinishLog !== nextState.highlightUnFinishLog ||
            this.state.showCalendar !== nextState.showCalendar;
        if (title !== nextProps.title) {
            this._saveWorkBeforeDestroy();
            this._removeFromLocalStorage();
            this._destroyEditor();
        }

        return result;
    },


    componentDidUpdate: function (prevProps, prevState) {
        var that = this;
        if (prevProps.title === this.props.title) {
            return;
        }
        this._hideContentChangeFlag();
        this._initEditor();
        this.readLog(this.props.title)
            .then(function (content) {
                var editor = that.editor;
                that.setValue(content);
                editor.focus();
                if (that.state.highlightUnFinishLog) {
                    that.highlightUnFinishLog();
                }
                that._starCacheLines();
                that.gotoDoingLogLine(content);
                that._highLightDoingLine(content);
                that._updateLogThatShouldBeginSoon();
                that._checkLogValid(content);
                that._listenToEditor();
                that._activeCurrentLine();
                that._updateLogProgress();
                that._annotationOverTimeLog(that.getAllLogs(), content);
                that.props.onLoad(content, that.getDoingLog(content));
                var timer = setTimeout(function() {
                    if (that.__reportOpened) {
                        that.renderTodayReport();
                    }
                    clearTimeout(timer);
                    timer = null;
                }, 500);
            });
    },

    _activeCurrentLine: function () {
        var line = this.editor.getSession().getLine(this._currentRow), log;
        if (line) {
            log = this.toLogObject(line)[0];
        }
        this.props.onLineChange(line, log);
    },

    gotoDoingLogLine: function (content) {
        var doingLog = this.getDoingLog(content);
        if (!doingLog) { return; }
        var index = this.getDoingLogIndex(doingLog, content);
        var columnPosition = doingLog.origin.indexOf('~') + 1;
        if (_.isNumber(index)) {
            this.gotoLine(index + 1, columnPosition);
            this.allocateLogInCalendar(doingLog);
            return true;
        }
    },

    setValue: function (content) {
        var editor = this.editor;
        editor.setValue(content, -1);
    },

    readLog: function (title) {
        var editor = this.editor;
        return DataAPI.getLogContent(title)
            .then(function (content) {
                return content;
            })
            .catch(function (err) {
                Notify.error('Open log content failed', {timeout: 3500});
            });
    },

    writeLog: function (title, content) {
        var start = Date.now();
        return DataAPI.writeLogContent(title, content).catch(function (err) {
            console.error(err.stack);
            Notify.error('Write file failed ', {timeout: 3500});
        });
    },

    isContentChange: function () {
        var title = this.props.title;
        return !!contentCache[title];
    },

    _persistCache: function () {
        var title = this.props.title;
        var content = contentCache[title];
        if (content !== undefined) {
            console.info('persist file ' + title);
            return this.writeLog(title, content)
                .then(function () {
                    delete contentCache[title];
                });
        } else {
            return Q(1);
        }
    },

    _persistToLocalStorage: function (title, content) {
        localStorage.setItem('file_' + title, content);
    },

    _recoveryFromLocalStorage: function () {
        var title = this.props.title;
        var cacheKey = 'file_' + title;
        var content = localStorage.getItem(cacheKey);
        return content;
    },

    _removeFromLocalStorage: function () {
        var key = 'file_' + this.props.title;
        console.info('remove from local storage ' + key);
        localStorage.removeItem(key);
    },

    save: function (content, notNotify) {
        var that = this;
        var beforeSave = function () {
            if (!notNotify) {NProgress.start();}
        }, onWarn = function() {
            //Notify.warning('warn from import log');
        };
        return this._save(
            this.props.title, content,
            beforeSave, onWarn
        ).then(function (cost) {
            if (!notNotify) {NProgress.done();}
            if (that.isMounted()) {
                that._achieveGoal();
                that.props.onSave(content);
                that.refs.accomplishment.update();
                //reset content change status to not change
                that._hideContentChangeFlag();
            }
        }).catch(function (err) {
            if (err.type !== LOG_NOT_VALID) {
                var errorMsg = 'error occur when import log ';
                if (err.message) {
                    errorMsg += err.message;
                }
                Notify.error(errorMsg);
            }
            if (!notNotify) {NProgress.done();}
        });
    },

    _annotationError: function (errors) {
        var errorAnnotations = _.isArray(errors) ? errors.map(function (error) {
            var index;
            if (error.type === 'sequence_error') {
                index = this.getLineIndex(error.origin[0]);
            } else {
                index = this.getLineIndex(error.origin);
            }
            return {
                row: index,
                column: 0,  // must be 0 based
                text: error.message,
                type: "error"
            }
        }, this) : [];
        this.editor.getSession().setAnnotations(errorAnnotations);
    },

    _annotationWarnings: function (warnings) {
        var warningAnnotations = _.isArray(warnings) ? warnings.map(function (warning) {
            return {
                row: warning.index,
                column: 0,  // must be 0 based
                text: warning.message,
                type: "warning"
            }
        }, this) : [];
        this.editor.getSession().setAnnotations(warningAnnotations);
    },


    _checkLogValid: function (content) {
        var title = this.props.title;
        var checkResult = Util.checkLogContent(title, content);
        var hasError = !_.isEmpty(checkResult.errors);
        if (hasError) {
            this._annotationError(checkResult.errors);
        }
        if (!_.isEmpty(checkResult.warns)) {
            this._annotationWarnings(checkResult.warns);
        }
    },

    _save: function (title, content, beforeSave, onWarn) {
        var that = this;
        if (this.__saveing) { return; }
        this.__saveing = true;
        return Q.promise(function (resolve, reject) {
            beforeSave && beforeSave();
            var checkResult = Util.checkLogContent(title, content);
            var hasError = !_.isEmpty(checkResult.errors);
            if (hasError) {
                that.__saveing = false;
                that._annotationError(checkResult.errors);
                return reject({
                    type: LOG_NOT_VALID,
                    message: 'File content is not valid.',
                    detail: checkResult.errors
                });
            }
            if (!_.isEmpty(checkResult.warns)) {
                that._annotationWarnings(checkResult.warns);
                onWarn && onWarn(checkResult.warns);
            }
            var start = new Date().getTime();
            //import into database, for stat purpose
            DataAPI.importLogContent(title, content).then(function () {
                var cost = new Date().getTime() - start;
                that.__saveing = false;
                contentCache[title] = null;
                resolve(cost);
            }).catch(function (err) {
                that.__saveing = false;
                console.error(err.stack);
                reject(err);
            });
        });
    },

    _achieveGoal: function () {
        DataAPI.achieveGoal(this.props.title).then(function (achievements) {
            if (!_.isEmpty(achievements)) {
                achievements.forEach(function (achievement) {
                    var goal = achievement.goal;
                    Util.notify({
                        title: 'Awesome!!! You just Achieve goal ' + goal.name + '\'s today amount',
                        subtitle : goal.name,
                        message: ' time: ' + Util.displayTime(achievement.time) + ' , percent: ' + achievement.progress.toFixed(1) + '%'
                    });
                });
            }
        })
    },

    _updateCurrentInfomation: function (currentLine) {
        var includeNoTimeLog = true;
        var that = this;
        return this._getDetailFromLogLineContent(this.props.title, currentLine)
            .then(function (result) {
                that._currentLog = result;
            });
    },

    _getDetailFromLogLineContent: function (date, lineContent) {
        var deferred = Q.defer();
        var includeNoTimeLog = true,
            result = {},
            log;
        try {
            log = TrackerHelper.getLogs(lineContent, date, includeNoTimeLog)[0];
            if (log) {
                var versionName;
                var project = log.projects && log.projects[0];
                var logVersion = log.version;
                var logTask = log.task;
                var subTask = log.subTask;
                if (project) {
                    if (logVersion) {
                        versionName = logVersion.name;
                    }
                    DataAPI.Project.load({name: project.name, aggregate: false}).then(function (projects) {
                        var version;
                        var project = projects[0];
                        if (project) {
                            result.project = project;
                            if (versionName) {
                                version = project.versions.filter(function (ver) {
                                    return ver.name === versionName;
                                })[0];
                                result.version = version;
                            }
                            if (logTask) {
                                DataAPI.Task.load({
                                    name: logTask.name,
                                    projectId: project.id,
                                    versionId: version && version._id,
                                    populate: false
                                }).then(function (tasks) {
                                    result.task = tasks[0];
                                    deferred.resolve(result);
                                });
                            } else {
                                return deferred.resolve(result);
                            }
                        } else {
                            return deferred.resolve(result);
                        }
                    });
                }
            } else {
                deferred.resolve(result);
            }
        } catch (e) {
            console.error(e.stack);
            deferred.resolve(result);
        }
        return deferred.promise;
    },

    _getCurrentLogInformation: function () {
        var log = this._currentLog;
        var info = {};
        if (log) {
            var project = log.project;
            var version = log.version;
            var task = log.task;
            if (project) {
                info.projectId = project.id || project._id.toString();
            }
            if (version) {
                info.versionId = version.id || version._id.toString();
            }
            if (task) {
                info.taskId = task.id || task._id.toString();
            }
        }
        console.error('current info', info);
        return info;
    },

    getDoingLog: function (content) {
        var title = this.props.title;
        var doingLog = Util.getDoingLog(title, content);
        return doingLog;
    },

    toggleHighlightUnFinishLog: function () {
        var highlight = !this.state.highlightUnFinishLog;
        this.setState({
            highlightUnFinishLog: highlight
        });
        this[highlight ? 'highlightUnFinishLog' : 'unhighlightUnFinishLog']();
    },

    toggleStarLine: function () {
        var index = this.getCurrentLineIndex();
        var log = this.getCurrentLine();
        if (!_.isString(log) || !log.trim() ) {
            return;
        }
        var starLines = __starLines[this.props.title];
        var foundIndex;
        var found = starLines.some(function (l, i) {
            if (l.log === log) {
                foundIndex = i;
                return true;
            }
            return false;
        });
        if (found) {
            this._unStarLine(index, foundIndex);
        } else {
            this._starLine(index, log);
        }
    },

    _starLine: function (index, log) {
        var starLines = __starLines[this.props.title];
        this.highlightLine(index, 'log-star');
        starLines.push({lineIndex: index, log: log});
    },

    _unStarLine: function (index, foundIndex) {
        var starLines = __starLines[this.props.title];
        this.unhighlightLine(index, 'log-star');
        starLines.splice(foundIndex, 1);
    },

    _starCacheLines: function () {
        var content = this.getContent();
        __starLines[this.props.title].forEach(function (l) {
            var lineIndex = this.getLineIndex(l.log, content);
            this.highlightLine(lineIndex, 'log-star');
        }, this);
    },

    _updateHighlightStarLine: function () {
        var that = this;
        var timer = setTimeout(function () {
            var content = that.getContent();
            var starLines = __starLines[that.props.title];
            var newStarLines = [];
            starLines.forEach(function (l) {
                this.unhighlightLine(l.lineIndex, 'log-star');
            }, that);
            starLines.forEach(function (l) {
                var newIndex = this.getLineIndex(l.log, content);
                if (Number.isInteger(newIndex)) {
                    this.highlightLine(newIndex, 'log-star');
                    newStarLines.push({lineIndex: newIndex, log: l.log});
                } else {
                    var currentLineIndex = this.getCurrentLineIndex();
                    var currentLine = this.getCurrentLine();
                    currentLine = currentLine.trim()
                    if (currentLine) {
                        newStarLines.push({lineIndex: currentLineIndex, log: currentLine});
                        this.highlightLine(currentLineIndex, 'log-star');
                    } else {
                        this.unhighlightLine(l.lineIndex, 'log-star');
                    }
                }
            }, that);
            __starLines[that.props.title] = newStarLines;
            clearTimeout(timer);
        }, 0);
    },

    highlightUnFinishLog: function () {
        var allLines = this.getAllLines();
        var that = this;
        var _highlightUnFinishLogIndex = [];
        var date = new Moment(this.props.title);
        var start = Moment(date).startOf('day').toDate();
        var end = Moment(date).endOf('day').toDate();
        this.getUnfinishLog(start, end)
            .then(function(unfinishLogs) {
                unfinishLogs.forEach(function (unfinishLog) {
                    var index = allLines.indexOf(unfinishLog.origin);
                    if (index >= 0) {
                        that.highlightLine(index, 'log-unfinish');
                        _highlightUnFinishLogIndex.push(index);
                    }
                })
                that._highlightUnFinishLogIndex = _highlightUnFinishLogIndex;
            });
    },

    unhighlightUnFinishLog: function () {
        var that = this;
        if (!_.isEmpty(that._highlightUnFinishLogIndex)) {
            that._highlightUnFinishLogIndex.forEach(function (index) {
                that.unhighlightLine(index, 'log-unfinish');
            });
            that._highlightUnFinishLogIndex = null;
        }
    },

    _updateLogThatShouldBeginSoon: function (logs) {
        logs = logs || this.getAllLogs(true);
        var allLines = this.getAllLines();
        var NOTIFY_THRESHOLD = 10;
        var mNow = new Moment();
        (this.__beginSoonHighlight || []).forEach(function (index) {
            this.unhighlightLine(index, 'log-beginsoon');
            this.unhighlightLine(index, 'log-overdue');
        }, this);
        this.__beginSoonHighlight = [];
        logs.forEach(function (log) {
            var mEstimateStart, mEstimateEnd, estimatedTime;
            if (log.estimateStart && !log.start) {
                mEstimateStart = new Moment(log.estimateStart);
                var index = allLines.indexOf(log.origin);
                var logFounded = index >= 0;
                var diff = mEstimateStart.diff(mNow, 'minute');
                if (logFounded) {
                    this.unhighlightLine(index, 'log-beginsoon');
                    this.unhighlightLine(index, 'log-overdue');
                }
                if (diff <= NOTIFY_THRESHOLD && diff >= 0) {
                    if (logFounded) {
                        this.unhighlightLine(index, 'log-overdue');
                        this.highlightLine(index, 'log-beginsoon');
                        this.__beginSoonHighlight.push(index);
                    }
                } else if (diff < 0){
                    if (logFounded) {
                        this.unhighlightLine(index, 'log-beginsoon');
                        this.highlightLine(index, 'log-overdue');
                        this.__beginSoonHighlight.push(index);
                    }
                }
            }
        }.bind(this));
    },


    getAllLines: function () {
        var editor = this.editor;
        var session = editor.getSession();
        return session.getDocument().getAllLines();
    },

    getContent: function () {
        return this.editor.getSession().getValue();
    },


    getAllLogs: function (includeNoTimeLog) {
        var content = this.getContent();
        var logs = TrackerHelper.getLogs(content, this.props.title, includeNoTimeLog);
        return logs;
    },

    highlightLine: function (index, highlightClass) {
        var editor = this.editor;
        var session = editor.getSession();
        var range = new Range(index, 0, index, Infinity);
        var marker = session.addMarker(range, "ace_step " + highlightClass || "", "fullLine");
        this._highlightMaker[index + highlightClass] = marker;
    },

    unhighlightLine: function (index, highlightClass) {
        var editor = this.editor;
        var session = editor.getSession();
        var key = index + highlightClass;
        var marker = this._highlightMaker[key];
        if (marker) {
            session.removeMarker(marker);
            delete this._highlightMaker[key];
        }
    },

    gotoLine: function (row, column) {
        if (this.editor) {
            this.editor.gotoLine(row, column);
            this._currentRow = row - 1;
        }
    },

    gotoLineByContent: function (lineContent) {
        var index = this.getLineIndex(lineContent);
        if (index !== undefined) {
            this.gotoLine(index + 1);
        }
    },

    toLogObject: function (line) {
        var result = TrackerHelper.getLogs(line, this.props.title, true);
        return result;
    },

    toggleCalendar: function () {
        this.setState({
            showCalendar: !this.state.showCalendar
        }, function () {
            this.editor.resize();
        });
    },

    allocateLogInCalendar: function (log) {
        if (!log) { return; }
        var calendar = this.refs.calendar;
        /*var allLines = this.getAllLines(), line;
        var targetIndex = null;
        for (var i = 0; i < allLines.length; i++) {
            line = allLines[i];
            if (Util.isValidLog(line)) {
                index = i + 1;
                if (line === log.origin) {
                    targetIndex = index;
                    break;
                }
            }
        }*/
        if (calendar) {
            calendar.unHighlightEventEl();
            var event = calendar.scrollToEventByStartTime(log.start);
            calendar.highlightEventEl(event.el);
            //calendar.scrollToEventByIndex(index - 1);
        }
    },

    openReport: function () {
        this.__reportOpened = !this.__reportOpened;
        this.refs.todayReport.toggle({
            width: $(this.getDOMNode()).width()
        });
    },

    renderTodayReport: function () {
        React.render(
            <TodayReport key={this.props.title} date={this.props.title} showDatePicker={false}/>,
            this.refs.reportContainer.getDOMNode()
        );
    },

    sortLogs: function () {
        var lines = this.getAllLines();
        var validLogs = [];
        var planLogs = []
        lines.forEach(function (line) {
            if (!line) { return false; }
            if (Util.isValidLog(line)) {
                validLogs.push(line);
            } else {
                planLogs.push(line);
            }
        });
        planLogs.sort(function (a,b) {return a.localeCompare(b)});
        this.setValue(validLogs.concat(planLogs).join('\n'));
    },

    getFirstPlanLog: function () {
        var result = null;
        (this.getAllLines() || []).some(function (line) {
            if (!line) {return false;}
            if (!Util.isValidLog(line)) {
                result = line;
                return true;
            }
            return false;
        });
        return result;
    },

    openHelpDoc: function () {
        this.refs.helpDoc.toggle({
            width: $(this.getDOMNode()).width()
        });
    },

    gotoLogByTimeConsumeOrder: function (order) {
        var lines = this.getAllLogs();
        var line = lines.sort(function (a, b) {
            return b.len - a.len;
        })[order];
        if (line) {
            var index = this.getLineIndex(line.origin);
            this.gotoLine(index + 1);
            this.allocateLogInCalendar(line);
        }
    },

    onCalendarEventClick: function (calEvent) {
        this._gotoLocate(calEvent.origin, this.getContent(), 1000);
    },

    _updateLogProgress: function () {
        var logs = this.getAllLogs(true);
        var done = 0, plan = 0, total = 0;
        logs.forEach(function (log) {
            if (log.start && log.end && log.len > 0) {
                done++;
            } else if (log.start && !log.end) {
                plan++;
            } else if (!log.start && !log.end) {
                plan++;
            }
        });

        total = done + plan;
        this.refs.logProgress.update(total, done);
    }

});


var Calendar = React.createClass({
    getDefaultProps: function () {
        return {
            onEventClick: noop
        };
    },

    render: function () {
        return <div className="ltt_c-logEditor-Calendar"></div>
    },

    componentDidMount: function () {
        var $calendar = $(this.getDOMNode());
        var calendarHeight = $calendar.height();
        this._calendarHeight = calendarHeight;
        var that = this;
        this.$calendar = $calendar;
        $calendar.fullCalendar({
            header: false,
            defaultView: 'agendaDay',
            editable: false,
            eventLimit: false,
            //scrollTime: new Moment(),
            allDaySlot: false,
            height: calendarHeight,
            defaultDate: this.props.date,
            events: function(start, end, timezone, callback) {
                var classes = config.classes;
                DataAPI.Log.load({
                    start: start.toDate(),
                    end: end.toDate(),
                    populate: true
                }).then(function (logs) {
                    var events = logs.map(function (log) {
                        var logClass = log.classes[0];
                        if (log.start === log.end) {
                            return null;
                        }
                        var data = _.extend({
                            title: getEventTitle(log),
                            start: new Moment(log.start),
                            end: new Moment(log.end)
                        }, _.pick(log, ['project', 'version', 'task', 'content', 'origin']));
                        if (logClass) {
                            var logClassObj = classes.filter(function (cls) {
                                return cls._id === logClass;
                            })[0];
                            if (logClassObj && logClassObj.color) {
                                var backgroupColor = logClassObj.color;
                                var borderColor = Color(backgroupColor).darken(0.2);
                                data.backgroundColor = backgroupColor;
                                data.borderColor = borderColor.rgbString();
                            }
                        }
                        return data;
                    });
                    callback(events.filter(function (event) {
                        return event !== null;
                    }));
                    that.setTimelineInterval();
                    that.scrollToAdaptiveEvent();
                }).catch(function (err) {
                    console.error(err.stack);
                    Notify.error('Sorry, failed to show calendar events!');
                });
            },
            eventClick: function(calEvent, jsEvent, view) {
                that.unHighlightEventEl();
                that.highlightEventEl($(this));
                that.props.onEventClick(calEvent);
            }
        });
    },


    componentWillReceiveProps: function (nextProps) {
        var that = this;
        if (nextProps.date !== this.props.date) {
            this.$calendar.fullCalendar('gotoDate', nextProps.date);
            var timer = setTimeout(function () {
                that.scrollToAdaptiveEvent();
                clearTimeout(timer);
            }, 100);
        }
    },

    setTimeline: function() {
        var $calendar = this.$calendar;
        var parentDiv = $calendar.find(".fc-slats:visible").parent();;
        var timeline = parentDiv.children(".timeline");
        if (timeline.length == 0) { //if timeline isn't there, add it
            timeline = $("<hr>").addClass("timeline");
            parentDiv.prepend(timeline);
        }

        var curTime = new Date();

        var curCalView = $calendar.fullCalendar('getView');
        if (curCalView.intervalStart < curTime && curCalView.intervalEnd > curTime) {
            timeline.show();
        } else {
            timeline.hide();
            return;
        }
        timeline.show();
        var curSeconds = (curTime.getHours() * 60 * 60) + (curTime.getMinutes() * 60) + curTime.getSeconds();
        var percentOfDay = curSeconds / 86400; //24 * 60 * 60 = 86400, # of seconds in a day
        var topLoc = Math.floor(parentDiv.height() * percentOfDay);

        timeline.css("top", topLoc + "px");

        if (curCalView.name == "agendaWeek") { //week view, don't want the timeline to go the whole way across
            var dayCol = $(".fc-today:visible");
            var left = dayCol.position().left + 1;
            var width = dayCol.width() - 2;
            timeline.css({
                left: left + "px",
                width: width + "px"
            });
        }
    },

    setTimelineInterval: function () {
        var that = this;
        if (this._intervalTimer) {
            clearInterval(this._intervalTimer);
        }
        this.setTimeline();
        this._intervalTimer = setInterval(function () {
            that.setTimeline();
        }, 60000);
    },

    componentWillUnmount: function () {
        if (this._intervalTimer) {
            clearInterval(this._intervalTimer);
        }
    },

    scrollToEvent: function (event) {
        if (!event) {return;}
        var $calendar = this.$calendar;
        var view = $calendar.fullCalendar('getView');
        var span = this._calendarHeight * 0.1;
        view.scrollerEl.animate({
            scrollTop: (event.top - span) || 0
        }, 500);
    },

    scrollToAdaptiveEvent: function () {
        if (new Moment().diff(this.props.date, 'day') === 0) {
            this.scrollToLastEvent();
        } else {
            this.scrollToFirstEvent();
        }
    },

    scrollToFirstEvent: function () {
        var view = this.$calendar.fullCalendar('getView');
        var event = _.first(view.getEventSegs());
        this.scrollToEvent(event);
    },

    scrollToLastEvent: function () {
        var view = this.$calendar.fullCalendar('getView');
        var event = _.last(view.getEventSegs());
        this.scrollToEvent(event);
    },

    refetch: function () {
        this.$calendar.fullCalendar('refetchEvents');
    },

    scrollToEventByIndex: function (index) {
        var view = this.$calendar.fullCalendar('getView');
        var event = view.getEventSegs()[index];
        if (event) {
            this.scrollToEvent(event);
        }
    },

    scrollToEventByStartTime: function (startTime) {
        var view = this.$calendar.fullCalendar('getView');
        var events = view.getEventSegs();
        var target;
        events.some(function (event) {
            if (Moment(event.start.toISOString()).isSame(startTime)) {
                target = event;
                this.scrollToEvent(event);
            }
        }, this);
        return target;
    },

    highlightEventEl: function (eventEl) {
        $(eventEl).addClass(EVENT_HIGHLIGHT_CLASS);
    },

    unHighlightEventEl: function (eventEl) {
        if (!event) {
            this.getAllEvents().forEach(function (event) {
                event.el.removeClass(EVENT_HIGHLIGHT_CLASS);
            });
        } else {
            $(eventEl).removeClass(EVENT_HIGHLIGHT_CLASS);
        }
    },

    getAllEvents: function () {
        var view = this.$calendar.fullCalendar('getView');
        return view.getEventSegs();
    }


});

var Accomplishment = React.createClass({

    mixins: [Router.Navigation],

    getInitialState: function () {
        return {
            versions: [],
            projects: [],
            tasks: []
        };
    },

    componentDidMount: function () {
        this.load();
    },

    render: function () {
        return (
            <div className="ltt_c-logEditor-accomplishment">
            {this.state.projects.length > 0 ?
                <OverlayTrigger trigger="click" placement="bottom"
                    overlay={this.renderPopOver(this.state.projects, "Project Today Achievement", function (proj) { return Util.getProjectUrl(proj)})}>
                    <span className="accomplishment-item projects">
                        project: <span className="ltt_c-number">{this.state.projects.length}</span>
                    </span>
                </OverlayTrigger> : null}
            {this.state.versions.length > 0 ?
                <OverlayTrigger trigger="click" placement="bottom"
                    overlay={this.renderPopOver(this.state.versions, "Version Today Achievement", function (version) { return Util.getVersionUrl(version);})}>
                    <span className="accomplishment-item task">
                        version: <span className="ltt_c-number">{this.state.versions.length}</span>
                    </span>
                </OverlayTrigger> : null}
            {this.state.tasks.length > 0 ?
                <OverlayTrigger trigger="click" placement="bottom"
                    overlay={this.renderPopOver(this.state.tasks, "Task Today Achievement", function (task) { return Util.getTaskUrl(task)})}>
                    <span className="accomplishment-item task">
                        task:<span className="ltt_c-number">{this.state.tasks.length}</span>
                    </span>
                </OverlayTrigger> : null}
            </div>
        );
    },

    renderPopOver: function (data, title, getUrl) {
        var itemHeight = 40;
        var height = (data.length > 6 ? 6 : data.length) * itemHeight;
        var popOver = (
            <Popover title={title} className="ltt_c-logEditor-accomplishment-popOver">
                <Scroller className="ltt_c-logEditor-accomplishment-popOver-scroller" height={height}>
                {data.map(function (item) {
                    var url = getUrl(item);
                    var projectSpan, versionSpan;
                    if (_.isObject(item.projectId)) {
                        projectSpan = <span className="project">{item.projectId.name}</span>
                    }
                    if (_.isObject(item.versionId)) {
                        versionSpan = <span className="version">{item.versionId.name}</span>
                    }
                    return <p className="item clickable" onClick={this.openLink.bind(this, url)}>
                        <span className={cx({"unfinish": item.progress !== 100})}>{item.name} {projectSpan} {versionSpan}</span>
                        {!_.isEmpty(item.children) ?
                            <ul>
                            {item.children.map(function (childItem) {
                                return <li onClick={this.openLink.bind(this, getUrl(item))} className="clickable">
                                 {childItem.name} </li>
                            }, this)}
                            </ul> : null
                        }
                    </p>
                }, this)}
                </Scroller>
            </Popover>
        );
        return popOver;
    },

    openLink: function (url) {
        this.transitionTo(url);
    },

    update: function () {
        this.load();
    },

    componentWillReceiveProps: function (nextProps) {
        if (this.props.date === nextProps.date) {
            return false;
        }
        this.load(nextProps.date);
    },

    load: function (date) {
        var that = this;
        date = date || this.props.date;
        DataAPI.Task.load({
            populate: true,
            populateFields: ['project', 'version'].join(','),
            calculateTimeConsume: false,
            start: new Moment(date).startOf('day').toDate(),
            end: new Moment(date).endOf('day').toDate(),
            status: 'done'
        }).then(function (data) {
            that.setState({
                tasks: data
            });
        }).catch(function (err) {
            console.error(err.stack);
        });
    }
});


function getEventTitle(log) {
    var title = '';
    if (!_.isEmpty(log.classes)) {
        title += log.classes.map(function (cls) {
            return Util.getClassName(cls);
        }).join(',');
    }
    if (!_.isEmpty(log.tags)) {
        title += '[' + log.tags.join(',') + ']';
    }
    return title;
}

function displayTime(timeAmount) {
    return Moment.duration(timeAmount, "minutes").format("M[m],d[d],h[h],mm[min]")
}

/**
 * LogProgress
 * show the log progress
 */
var LogProgress = React.createClass({

    getInitialState: function () {
        return {
            done: this.props.done,
            total: this.props.total
        }
    },

    render: function () {
        return <div className="ltt_c-LogProgress">
            <Progress value={this.state.done} max={this.state.total}/>
        </div>
    },

    update: function (total, done) {
        this.setState({
            done: done,
            total: total
        });
    }
});


function getEstimateTime(log) {
    var estimatedTime = log.estimatedTime;
    if (!estimatedTime) {
        if (log.estimateStart && log.estimateEnd) {
            estimatedTime = new Moment(log.estimateEnd).diff(log.estimateStart, 'minute');
        }
    }
    return estimatedTime;
}



module.exports = LogEditor;