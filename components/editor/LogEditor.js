var React = require('react');
var _ = require('lodash');
var Q = require('q');
var RB = require('react-bootstrap');
var Button = RB.Button;
var ButtonToolbar = RB.ButtonToolbar;
var DropdownButton = RB.DropdownButton;
var MenuItem = RB.MenuItem;
var Moment = require('moment');
var Color = require('color');
var TrackerHelper = require('tracker/helper');


/**Components*/
var Settings = require('../../pages/Settings');

//store key
var SK_CONTENT = 'content';
var Ltt = global.Ltt;
var Notify = require('../Notify');
var Mt = window.Mousetrap;
var NProgress = require('nprogress');
var NO_SYNC = 1, SYNCING = 2, SYNC_ERROR = 3;
var Range = ace.require('ace/range').Range;

/** constant */
var EventConstant = require('../../constants/EventConstant');
var EVENT_HIGHLIGHT_CLASS = 'event-highlight';
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
//window.contentCache = contentCache;
var LogEditor = React.createClass({


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

    render: function () {
        var start = new Date().getTime();
        console.log('render component logEditor');
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

        return (
            <div className="ltt_c-logEditor">
                <div className="ltt_c-logEditor-header">
                    <div className="ltt_c-logEditor-header-left">
                        <span className="ltt_c-logEditor-header-toggleCalendar"
                            onClick={this.toggleCalendar}>
                            <i className="fa fa-calendar"></i>
                        </span>
                        <span className="ltt_c-logEditor-title">{this.props.title}</span>
                    </div>
                    <div className="ltt_c-logEditor-header-right">
                        <ButtonToolbar>
                            <Button onClick={this.onHighlightUnFinishLog} bsSize='small' title='show unfinish log' active={this.state.highlightUnFinishLog}><i className="fa fa-magic"></i></Button>
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
                <div className="ltt_c-logEditor-content">
                    {this.state.showCalendar ? <Calendar date={this.props.title} ref="calendar"/> : null }
                    <Editor ref="editor"/>
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
                console.log('recover ' + title + ' from localStorage');
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
            that.gotoDoingLogLine(content);
            that._gotoLocate(content, that.props.locate);
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

    _gotoLocate: function (content, locate) {
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
            setTimeout(function () {
                session.removeMarker(marker);
            }, 10000);
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
                console.log('tokenValue:' + tokenValue + ' prefix:' + prefix);
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
        return editor;
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
            console.log('插入到第' + (line + 1) + '行: ' + log);
            session.insert({row: line + 1, column: 0}, '\n' + log);
            this.gotoLine(line + 1, log.length);
        }
    },

    insertLogToLastValidLogLine: function (log) {
        var editor = this.editor;
        var session = editor.getSession()
        var allLines = session.getDocument().getAllLines();
        var index = 1;
        for (var i = 0; i < allLines.length; i++) {
            if (Util.isValidLog(allLines[i])) {
                index = i + 1;
            }
        }
        var newLine = index;
        if (allLines[index]) {
            log += '\n';
        }
        session.insert({row: newLine, column: 0}, log);
        return newLine;
    },

    getLastValidLog: function () {
        var editor = this.editor;
        var session = editor.getSession()
        var allLines = session.getDocument().getAllLines();
        var index = 1;
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
        console.log('Destroy editor start');
        if (this.editor) {
            this.editor.destroy();
            this._highlightMaker = {};
            this._highlightUnFinishLogIndex = null;
            this._currentRow = null;
            this.refs.editor.getDOMNode().innerHTML = '';
            this.editor = null;
            console.log('Destroy editor end');
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
            bindKey: {win: 'Ctrl-n', mac: 'Command-n'},
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
            bindKey: {win: 'Ctrl-Shift-b', mac: 'Command-Shift-b'},
            exec: function (editor) {
                var session = editor.getSession();
                var doc = session.getDocument();
                var validLog = that.getLastValidLog();
                var timeStr = new Moment().format('HH:mm') + '~';
                var pos = editor.getCursorPosition();
                var line = session.getLine(pos.row);
                var newIndex = validLog.index;
                //move line
                var range = new Range(pos.row, 0, pos.row, Infinity);
                session.moveText(range, {row: newIndex, column: 0});
                var pos = {row: newIndex, column: line.length};
                session.insert(pos, '\n');
                //insert time
                session.insert({row: newIndex, column: 0}, timeStr);
                that.gotoLine(newIndex + 1, timeStr.length);
            }
        });

        commands.addCommand({
            name: 'finishActivity',
            bindKey: {win: 'Ctrl-Shift-f', mac: 'Command-Shift-f'},
            exec: function (editor) {
                if (that.gotoDoingLogLine(editor.getValue())) {
                    editor.insert(new Moment().format('HH:mm'));
                }
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
    },


    getTagCompletions: function (prefix, cb) {
        console.log('get tag completions start');
        var that = this;
        Ltt.sdk.tags({name: prefix}).then(function (tags) {
            if (_.isEmpty(tags)) {
                return cb(null, []);
            }
            var completions = tags.map(function (tag) {
                return {name: tag.name, value: tag.name, meta: 'tag'};
            });
            console.log('tags :' + completions);
            cb(null, completions);
        });
    },

    getProjectCompletions: function (line, cb) {
        //var projects = [{name: 'life-time-tracker'}, {name: 'wa'}];
        console.log('getProjectCompletions start');
        var start = new Date().getTime();
        var that = this;
        Ltt.sdk.projects({aggregate: false, versions: false}).then(function(projects) {
            //if not projects, then no need to create typeahead
            if (_.isEmpty(projects)) {return cb(null, [])}
            var end = new Date().getTime();
            var completions = projects.map(function(proj) {
                var score = new Date(proj.lastActiveTime).getTime()
                return {name: proj.name, value: proj.name, score: score, meta: progressTpl(proj)};
            });
            console.log('getProjectCompletions end cost ' + (end - start))
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
            console.log(info);
            if (!info.projectId) { return cb(null, []); }
            return Ltt.sdk.versions({projectId: info.projectId}).then(function (versions) {
                console.log('versions', versions);
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
            console.log(info);
            if (!info.projectId) { return cb(null, []); }
            return Ltt.sdk.tasks({projectId: info.projectId, versionId: info.versionId, populate: false, parent: info.taskId})
                .then(function (tasks) {
                    if (_.isEmpty(tasks)) { return cb(null, []); }
                    console.log(tasks);
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
        this._persistCache();
        this._removeFromLocalStorage();
        this._destroyEditor();
    },

    _listenToEditor: function () {
        console.log('listen to editor');
        var that = this;
        var editor = this.editor;
        var session = editor.getSession();
        var selection = editor.getSelection();
        session.on('change', _.debounce(function (e) {
            console.log('editor content change');
            var title = that.props.title; //title can not be outside of this function scope,make sure that the title is the lastest.
            var content = session.getValue();
            contentCache[title] = content;
            //persist to localstorage, if app exit accidently, can recovery from localstorage
            that._persistToLocalStorage(title, content);
            that._highLightDoingLine(content);
            that.props.onChange(content, editor);
        }, 200));

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
        console.log('listen to editro');
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
        console.log('doing log index = ' + index);
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

    getDoingLogIndex: function (doingLog, content) {
        if (!doingLog) {
            doingLog = this.getDoingLog(content);
        }
        var index;
        if (doingLog) {
            index = getLineIndex(content, doingLog.origin);
        }
        function getLineIndex (content, line){
            var lines = content.split('\n');
            for (var i = 0; i < lines.length; i++) {
                if (lines[i] === line) {
                    return i;
                }
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
            //only change the content will write to cache, it means if the content doesn't change
            //then no need to write the file to disk
            this._persistCache();
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
        this._initEditor();
        this.readLog(this.props.title)
            .then(function (content) {
                var editor = that.editor;
                that.setValue(content);
                editor.focus();
                if (that.state.highlightUnFinishLog) {
                    that.highlightUnFinishLog();
                }
                that.gotoDoingLogLine(content);
                that._highLightDoingLine(content);
                that._listenToEditor();
                that._activeCurrentLine();
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
        var editor = this.editor;
        var columnPosition = doingLog.origin.indexOf('~') + 1;
        if (_.isNumber(index)) {
            this.gotoLine(index + 1, columnPosition);
            return true;
        }
    },

    setValue: function (content) {
        var editor = this.editor;
        editor.setValue(content, -1);
    },

    readLog: function (title) {
        var start = Date.now();
        var editor = this.editor;
        return DataAPI.getLogContent(title)
            .then(function (content) {
                console.log('read log cost:' + (Date.now() - start));
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


    _persistCache: function () {
        var title = this.props.title;
        var content = contentCache[title];
        if (content) {
            console.log('persist file ' + title);
            this.writeLog(title, content);
            delete contentCache[title];
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
        console.log('remove from local storage ' + key);
        localStorage.removeItem(key);
    },

    save: function (content) {
        var that = this;
        var title = this.props.title;
        if (this.__saveing) { console.log('saving log is going'); return; }
        this.__saveing = true;
        NProgress.start();
        //write to local filesystem
        var checkResult = Util.checkLogContent(title, content);
        /* use sessioon.setAnnotations(annotations) to display error message
            [{
                row: error.line-1, // must be 0 based
                column: error.character,  // must be 0 based
                text: error.message,  // text to show in tooltip
                type: "error"|"warning"|"info"
            }]
        */
        var hasError = !_.isEmpty(checkResult.errors);
        if (hasError) {
            Notify.error('error occur when import log ' + checkResult.errors.map(function (error) {
                return error.origin + error.message;
            }).join('\n'));
            NProgress.done();
            that.__saveing = false;
        }
        if (!_.isEmpty(checkResult.warns)) {
            Notify.warning('warn from import log');
        }
        var start = new Date().getTime();
        //import into database, for stat purpose
        return !hasError && DataAPI.importLogContent(title, content).then(function () {
            NProgress.done();
            that.props.onSave(content);
            that.__saveing = false;
            console.log('import cost' + (new Date().getTime() - start));
            /*
            //don't need to sync if already syncing.
            if (that.state.syncStatus === SYNCING) { return; }
            var timer = setTimeout(function () {
                //start back up log file after log import successfully
                //may have change since the content may have changed
                //use the timer to optimize the performerce
                console.log('start backup' + (new Date().getTime() - start));
                that.setState({syncStatus: SYNCING}, function () {
                    DataAPI.backUpLogFile(title, content).then(function (result) {
                        console.error('done');
                        that.setState({syncStatus: NO_SYNC}, function () {
                            console.log('save total cost' + (new Date().getTime() - start));
                            //init the project typeahead component again because the projects
                            //that._initProjectTypeahead();
                        });
                    }).catch(function (err) {
                        console.error(err.stack);
                        that.setState({syncStatus: SYNC_ERROR});
                        Notify.error('Save to evernote failed' + err.message, {timeout: 3500});
                    });
                });
                clearTimeout(timer);
            }, 200);*/
        }).catch(function (err) {
            that.__saveing = false;
            NProgress.done();
            console.error(err.stack);
            Notify.error('Import failed', {timeout: 3500});
        });
    },

    _updateCurrentInfomation: function (currentLine) {
        var includeNoTimeLog = true;
        var that = this;
        console.log('_updateCurrentInfomation start');
        var start = new Date().getTime();
        return Ltt.sdk.getDetailFromLogLineContent(this.props.title, currentLine)
            .then(function (result) {
                console.log('_updateCurrentInfomation end ' + (new Date().getTime() - start));
                that._currentLog = result;
            });
    },

    _getCurrentLogInformation: function () {
        var log = this._currentLog;
        console.log(log);
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

    onHighlightUnFinishLog: function () {
        var highlight = !this.state.highlightUnFinishLog;
        this.setState({
            highlightUnFinishLog: highlight
        });
        this[highlight ? 'highlightUnFinishLog' : 'unhighlightUnFinishLog']();
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
                that.unhighlightLine(index);
            });
            that._highlightUnFinishLogIndex = null;
        }
    },

    getAllLines: function () {
        var editor = this.editor;
        var session = editor.getSession();
        return session.getDocument().getAllLines();
    },

    highlightLine: function (index, highlightClass) {
        var editor = this.editor;
        var session = editor.getSession();
        var range = new Range(index, 0, index, Infinity);
        var marker = session.addMarker(range, "ace_step " + highlightClass || "", "fullLine");
        this._highlightMaker[index] = marker;
    },

    unhighlightLine: function (index) {
        var editor = this.editor;
        var session = editor.getSession();
        var marker =this._highlightMaker[index];
        if (marker) {
            session.removeMarker(marker);
        }
    },

    gotoLine: function (row, column) {
        if (this.editor) {
            this.editor.gotoLine(row, column);
            this._currentRow = row - 1;
        }
    },

    toLogObject: function (line) {
        var result = TrackerHelper.getLogs(line, this.props.title);
        return result;
    },

    toggleCalendar: function () {
        this.setState({
            showCalendar: !this.state.showCalendar
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
            calendar.unHighlightEvent();
            var event = calendar.scrollToEventByStartTime(log.start);
            calendar.highlightEvent(event);
            //calendar.scrollToEventByIndex(index - 1);
        }
    }
});

var Editor = React.createClass({
    render: function () {
        return <pre id="ltt-logEditor"></pre>;
    },

    shouldComponentUpdate: function () {
        return false;
    }
});
var Calendar = React.createClass({

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
                        }, _.pick(log, ['project', 'version', 'task', 'content']));
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
                    console.log(err.stack);
                    Notify.error('Sorry, failed to show calendar events!');
                });
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
        view.scrollerEl.scrollTop((event.top - span) || 0);
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

    highlightEvent: function (event) {
        event.el.addClass(EVENT_HIGHLIGHT_CLASS);
    },

    unHighlightEvent: function (event) {
        if (!event) {
            this.getAllEvents().forEach(function (event) {
                event.el.removeClass(EVENT_HIGHLIGHT_CLASS);
            });
        } else {
            event.el.removeClass(EVENT_HIGHLIGHT_CLASS);
        }
    },

    getAllEvents: function () {
        var view = this.$calendar.fullCalendar('getView');
        return view.getEventSegs();
    }
})


function getEventTitle(log) {
    var title = '';
    if (!_.isEmpty(log.classes)) {
        title += log.classes.join(',');
    }
    if (!_.isEmpty(log.tags)) {
        title += '[' + log.tags.join(',') + ']';
    }
    return title;
}

module.exports = LogEditor;