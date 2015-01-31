var React = require('react');
var store = require('store2');
var editorStore = store.namespace('LogEditor');
var _ = require('lodash');
var Q = require('q');

var contentCache = {};
//store key
var SK_CONTENT = 'content';
var Ltt = global.Ltt;
var Notify = require('../Notify');
var Mt = window.Mousetrap;
var NProgress = require('nprogress');
var NO_SYNC = 1, SYNCING = 2, SYNC_ERROR = 3;
var Range = ace.require('ace/range').Range;
var DataAPI = require('../../utils/DataAPI');


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
        NProgress.configure({parent: '.ltt_c-logEditor-header', showSpinner: false});
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
                    <i className={syncIcon}></i>
                </div>
                <div className="ltt_c-logEditor-projects ltt_c-logEditor-typeahead" ref="projects"></div>
                <div className="ltt_c-logEditor-versions  ltt_c-logEditor-typeahead" ref="versions"></div>
                <div className="ltt_c-logEditor-tasks  ltt_c-logEditor-typeahead" ref="tasks"></div>
                <Editor/>
            </div>
        );
    },

    componentDidMount: function () {
        var start, end;
        start = new Date().getTime();
        console.log('component logEditor did mount');
        var that = this;
        this._initShortcut();
        var editor = ace.edit("ltt-logEditor");
        this.editor = editor;
        editor.setTheme("ace/theme/github");
        var session = editor.getSession();
        session.setMode("ace/mode/ltt");
        session.setUseWrapMode(true);
        //editor.setBehavioursEnabled(true);
        //content = editorStore(SK_CONTENT);
        this._initProjectTypeahead();
        this._initEditorCommand();
        end = new Date().getTime();
        console.log('ready to read Log ' + (end - start));
        start = new Date().getTime();
        Ltt && this.readLog(this.props.title).then(function (content) {
            end = new Date().getTime();
            that.setValue(content);
            var highLightIndex = that._highLightDoingLine();
            editor.gotoLine(highLightIndex + 1, 6);
            that.props.onLoad(content);
            editor.focus();
            that._listenToEditor();
            console.log('read Log and init ace edtior' + (end - start));
        });
    },

    componentWillUnmount: function () {
        var session = this.editor.getSession();
        session.removeAllListeners('change');
    },

    _listenToEditor: function () {
        console.log('listen to editor');
        var that = this;
        var editor = this.editor;
        var session = editor.getSession();
        session.on('change', _.debounce(function (e) {
            console.log('editor content change');
            var data = e.data;
            var title = that.props.title; //title can not be outside of this function scope,make sure that the title is the lastest.
            var content = editor.getValue();
            var session = that.editor.getSession();
            //when content change, persist to file in hardware
            if (data && data.action === "insertText") {
                var pos = that.editor.getCursorPosition();
                var lineContent = session.getLine(pos.row);
                if (data.text === '<') {
                    openInput(that.refs.projects);
                } else if (data.text === '$') {
                    openInput(that.refs.versions, lineContent,  that._initVersionTypeahead.bind(that));
                } else if (data.text === '(') {
                    openInput(that.refs.tasks, lineContent, that._initTaskTypeahead.bind(that));
                }
            }
            that._highLightDoingLine();
            that.writeLog(title, content);
            that.props.onChange(content, editor);

            function openInput(ref, lineContent, initFunction) {

                return that._updateCurrentInfomation(lineContent).then(initFunction).then(function (open) {
                    if (open === false) { console.log('open = false'); return; }
                    var pos = editor.getCursorPositionScreen();
                    var $inputHolder = $(ref.getDOMNode());
                    var $input = $('.ace_text-input');
                    console.log($input, $input.css('top'));
                    var css = {
                        top: parseInt($input.css('top')) + 40,
                        left: $input.css('left'),
                        height: 16
                    };
                    $inputHolder.show().css(css);
                    $inputHolder.find('.typeahead').focus();
                }).catch(function (err) {
                    console.error(err.stack);
                });
            }
        }, 300));
    },

    _highLightDoingLine: function () {
        var editor = this.editor;
        var title = this.props.title;
        var session = this.editor.getSession();
        var content = editor.getValue();
        var doingLog = Ltt.sdk.getDoingLog(title, content);
        var range, marker;
        this._doingLog = doingLog;
        var index;
        if (doingLog) {
            index = getLineIndex(content, doingLog.origin);
            if (_.isNumber(index)) {
                if (this._doingLogIndex !== index) {
                    removeHighlight(this._doingLogMarker);
                    this._doingLogIndex = index;
                    this._doingLogMarker = highlight(index);
                } else if (!this._doingLogMarker) {
                    this._doingLogMarker = highlight(index);
                }
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
        function getLineIndex (content, line){
            var lines = content.split('\n');
            for (var i = 0; i < lines.length; i++) {
                if (lines[i] === line) {
                    return i;
                }
            }
        };
        function removeHighlight(marker) {
            if (marker) {
                session.removeMarker(marker);
            }
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
            bindKey: {win: 'Ctrl-\\', mac: 'Command-\\'},
            exec: function (editor) {
                var index = that._doingLogIndex;
                editor.gotoLine(index + 1, 6);
            }
        })
    },

    _initShortcut: function () {
        var that = this;
        Mt.bind('esc', function (e) {
        });
    },

    _initProjectTypeahead: function () {
        //var projects = [{name: 'life-time-tracker'}, {name: 'wa'}];
        var start = new Date().getTime();
        var that = this;
        return Ltt.sdk.projects({aggregate: false}).then(function(projects) {
            //if not projects, then no need to create typeahead
            if (_.isEmpty(projects)) { return Q(false); }
            that._createTypeahead('.ltt_c-logEditor-projects', '>', 'projects',
                projects.map(function (project) {
                    return _.pick(project, ['name', 'id']);
                })
            );
            var end = new Date().getTime();
            console.log('iniit project type ahead cost ' + (end - start))
        });
    },

    _initVersionTypeahead: function () {
        var info = this._getCurrentLogInformation();
        var that = this;
        if (!info.projectId) { return Q(false); }
        console.log('init version typeahead');
        return Ltt.sdk.versions({projectId: info.projectId}).then(function (versions) {
            if (_.isEmpty(versions)) { return Q(false); }
            that._createTypeahead('.ltt_c-logEditor-versions', '$', 'versions',
                versions.map(function (version) {
                    version = _.pick(version, ['name', 'id']);
                    return version;
                })
            ); 
        });
    },

    _initTaskTypeahead: function () {
        var info = this._getCurrentLogInformation();
        var that = this;
        if (info.projectId) {
            return Ltt.sdk.tasks({projectId: info.projectId, versionId: info.versionId, populate: false})
                .then(function (tasks) {
                    if (_.isEmpty(tasks)) { return Q(false); }
                    that._createTypeahead('.ltt_c-logEditor-tasks', ')', 'tasks',
                        tasks.map(function (task) {
                            return _.pick(task, ['name', 'id']);
                        })
                    );
                });
        } else {
            return Q(false);
        }
    },

    _createTypeahead: function createTypeahead(selector, postfix, placeholder, datasets, callback) {
        var start = new Date().getTime();
        var that = this;
        var $holder = $(selector).empty();
        $input = $('<input class="typeahead" type="text" placeholder="' + placeholder + '"/>');
        $holder.append($input);
        var projectTypeahead = $input.typeahead({
            hint: false,
            highlight: true,
            minLength: 0
        }, {
            name: 'states',
            displayKey: 'value',
            source: substringMatcher(datasets)
        }).on('typeahead:closed', function () {
            that.hideTypeAhead();
            that.editor.focus();
            $input.typeahead('val', '');
        }).on('typeahead:selected', function (e, obj) {
            that.hideTypeAhead();
            that.editor.insert(obj.value + postfix);
            var timer = setTimeout(function () {
                that.editor.focus();
                clearTimeout(timer);
            }, 0);
            callback && callback(obj);
        });
        $input.on('focus', function () {
            console.log('input focus');
            var ev = $.Event("keydown");
            ev.keyCode = ev.which = 40;
            $(this).trigger(ev);
        });
        $input.focus();
        function substringMatcher (items) {
            return function findMatches(q, cb) {
                var matches, substrRegex;
                // an array that will be populated with substring matches
                matches = [];
                // regex used to determine if a string contains the substring `q`
                substrRegex = new RegExp(q, 'i');
                // iterate through the pool of strings and for any string that
                // contains the substring `q`, add it to the `matches` array
                $.each(items, function(i, item) {
                    if (substrRegex.test(item.name)) {
                        // the typeahead jQuery plugin expects suggestions to a
                        // JavaScript object, refer to typeahead docs for more info
                        matches.push({
                            value: item.name,
                            id: item.id
                        });
                    }
                });
                cb(matches);
            };
        };
    },

    hideTypeAhead: function () {
        $(this.refs.projects.getDOMNode()).hide();
        $(this.refs.versions.getDOMNode()).hide();
        $(this.refs.tasks.getDOMNode()).hide();
    },

    shouldComponentUpdate: function (nextProps, nextState) {
        var result = this.props.title !== nextProps.title ||
            this.state.syncStatus !== nextState.syncStatus;

        return result;
    },


    componentWillUpdate: function () {
        //get the editor position
        this.currentPosition = this.editor.getCursorPosition();
    },

    componentDidUpdate: function (prevProps, prevState) {
        var that = this;
        if (prevProps.title === this.props.title) {
            return;
        }
        var editor = this.editor;
        this.readLog(this.props.title)
            .then(function (content) {
                that.setValue(content);
                var highLightIndex = that._highLightDoingLine();
                editor.gotoLine(highLightIndex + 1, 5);
                editor.focus();
            });
    },

    setValue: function (content) {
        var editor = this.editor;
        editor.setValue(content, -1);
        var pos = this.currentPosition;
        if (pos) {
            editor.moveCursorToPosition(pos);
        }
    },

    readLog: function (title) {
        var editor = this.editor;
        if (!Ltt) { return; }
        return Ltt.sdk.readLogContent(title)
            .then(function (content) {
                return content;
            })
            .catch(function (err) {
                Notify.error('Open log content failed', {timeout: 3500});
            });
    },

    writeLog: function (title, content) {
        if (!Ltt) {return;}
        Ltt.sdk.writeLogFile(title, content).catch(function (err) {
            console.error(err.stack);
            Notify.error('Write file failed ', {timeout: 3500});
        });
    },


    save: function (content) {
        var start = new Date().getTime();
        var that = this;
        var title = this.props.title;
        if (this.__saveing) { console.error('syncing'); return; }
        this.__saveing = true;
        NProgress.start();
        //write to local filesystem
        Ltt.sdk.writeLogFile(title, content).then(function () {
            console.log('write file cost' + (new Date().getTime() - start));
            that.props.onSave(content);
            NProgress.set(0.3);
            //import into database, for stat purpose
            Ltt.sdk.importLogContent(title, content).then(function () {
                NProgress.done();
                that.__saveing = false;
                console.log('import cost' + (new Date().getTime() - start));
                //don't need to sync if already syncing.
                if (that.state.syncStatus === SYNCING) { return; }
                var timer = setTimeout(function () {
                    //start back up log file after log import successfully
                    //may have change since the content may have changed
                    //use the timer to optimize the performerce
                    console.log('start back' + (new Date().getTime() - start));
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
                }, 200);
            }).catch(function (err) {
                that.__saveing = false;
                NProgress.done();
                console.error(err.stack);
                Notify.error('Import failed', {timeout: 3500});
            });
        }).catch(function (err) {
            that.__saveing = true;
            NProgress.done();
            console.error(err.stack);
            Notify.error('Write file failed ', {timeout: 3500});
        });
    },

    _updateCurrentInfomation: function (currentLine) {
        var includeNoTimeLog = true;
        var that = this;
        return Ltt.sdk.getDetailFromLogLineContent(this.props.title, currentLine)
            .then(function (result) {
                that._currentLog = result;
                console.error('current log', result);
            });
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

    getDoingLog: function () {
        return this._doingLog;
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