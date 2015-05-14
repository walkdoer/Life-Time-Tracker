var React = require('react');
var store = require('store2');
var editorStore = store.namespace('LogEditor');
var _ = require('lodash');
var Q = require('q');
var RB = require('react-bootstrap');
var Button = RB.Button;
var ButtonToolbar = RB.ButtonToolbar;
var Moment = require('moment');



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

/**util*/
var DataAPI = require('../../utils/DataAPI');
var Bus = require('../../utils/Bus');
var Util = require('../../utils/Util');

var progressTpl = _.template('<%=progress%>%');

var _insertLog = null;
Bus.on(EventConstant.INSERT_LOG_FROM_TASK, function (log) {
    _insertLog = log;
});

/** cache */
var contentCache = {};
window.contentCache = contentCache;
var LogEditor = React.createClass({

    getDefaultProps: function () {
        return {
            onLoad: function () {},
            onChange: function () {},
            onSave: function () {}
        };
    },

    getInitialState: function () {
        return {
            syncStatus: NO_SYNC
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
                    <span className="ltt_c-logEditor-title">{this.props.title}</span>
                    <ButtonToolbar>
                        <Button onClick={this.insertYesterdayUnfinishTaskLog} title="insert yesterday's unfinish task" bsSize='small'>
                            <i className="fa fa-copy"></i>
                        </Button>
                    </ButtonToolbar>
                </div>
                <div className="ltt_c-logEditor-projects ltt_c-logEditor-typeahead" ref="projects"></div>
                <div className="ltt_c-logEditor-versions  ltt_c-logEditor-typeahead" ref="versions"></div>
                <div className="ltt_c-logEditor-tasks  ltt_c-logEditor-typeahead" ref="tasks"></div>
                <Editor ref="editor"/>
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
                    if (result === -1) {
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
            that.props.onLoad(content);
            editor.focus();
            if (_insertLog) {
                that.insertLogToLastLine(_insertLog.origin);
                _insertLog = null;
            }
            that._listenToEditor();
        }).fail(function (err) {
            console.error(err);
            console.error(err.stack);
        });
    },

    _initEditor: function () {
        var that = this;
        var editor = ace.edit("ltt-logEditor");
        this.editor = editor;
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

    insertYesterdayUnfinishTaskLog: function () {
        var that = this;
        DataAPI.Log.load({
            start: new Moment().subtract(1, 'day').startOf('day').toDate(),
            end: new Moment().subtract(1, 'day').endOf('day').toDate(),
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
                    if (progress && (
                        progress.task > 0 && progress.task < 100 ||
                        progress.subTask > 0 && progress.subTask < 100)) {
                        unfinishLog.push(lastLog.origin);
                    }
                }
            });
            that.insertLogToLastLine(unfinishLog.join('\n'));
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
            this.editor.gotoLine(line + 1, log.length);
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
                that.save(editor.getValue());
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
                editor.gotoLine(line + 1, log.length);
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
                editor.gotoLine(newIndex + 1, timeStr.length);
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
        console.log('listen to editro');
    },

    _detachListenToEditor: function () {
        var session = this.editor.getSession();
        session.removeAllListeners('change');
        console.log('remove listeners');
    },

    _highLightDoingLine: function (content) {
        if (!Ltt) {return;}
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
            this.state.syncStatus !== nextState.syncStatus;
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
                that.gotoDoingLogLine(content);
                that._highLightDoingLine(content);
                that._listenToEditor();
            });
    },

    gotoDoingLogLine: function (content) {
        var doingLog = this.getDoingLog(content);
        if (!doingLog) { return; }
        var index = this.getDoingLogIndex(doingLog, content);
        var editor = this.editor;
        var columnPosition = doingLog.origin.indexOf('~') + 1;
        if (_.isNumber(index)) {
            editor.gotoLine(index + 1, columnPosition);
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
        if (!Ltt.sdk) { return Q(''); }
        return Ltt.sdk.readLogContent(title)
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
        if (!Ltt || !Ltt.sdk ||!Ltt.sdk.writeLogFile) {return Q(-1);}
        return Ltt.sdk.writeLogFile(title, content).catch(function (err) {
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
        !hasError && Ltt.sdk.importLogContent(title, content).then(function (err) {
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

module.exports = LogEditor;