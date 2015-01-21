var React = require('react');
var store = require('store2');
var editorStore = store.namespace('LogEditor');
var _ = require('lodash');

var contentCache = {};
//store key
var SK_CONTENT = 'content';
var Ltt = global.Ltt;
var Notify = require('../Notify');
var Mt = window.Mousetrap;
var NProgress = require('nprogress');
var NO_SYNC = 1, SYNCING = 2, SYNC_ERROR = 3;
var Range = ace.require('ace/range').Range;


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
                <pre id="ltt-logEditor"></pre>
            </div>
        );
    },

    componentDidMount: function () {
        var that = this;
        this._initShortcut();
        var editor = ace.edit("ltt-logEditor");
        this.editor = editor;
        editor.setTheme("ace/theme/github");
        var session = editor.getSession();
        session.setMode("ace/mode/ltt");
        //session.setUseWrapMode(true);
        //editor.setBehavioursEnabled(true);
        //content = editorStore(SK_CONTENT);
        this._initProjectTypeahead();
        this._initEditorCommand();
        Ltt && this.readLog(this.props.title).then(function (content) {
            that.setValue(content);
            that._highLightDoingLine();
            that.props.onLoad(content);
            that._listenToEditor();
        });
    },

    _listenToEditor: function () {
        console.log('listen to editor');
        var that = this;
        this.editor.on('change', _.debounce(function (e, editor) {
            console.log('change');
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
                    openInput(that.refs.versions, lineContent).then(that._initVersionTypeahead.bind(that));
                } else if (data.text === '(') {
                    openInput(that.refs.tasks, lineContent).then(that._initTaskTypeahead.bind(that));
                }
            }
            that._highLightDoingLine();
            that.writeLog(title, content);
            that.props.onChange(content, editor);

            function openInput(ref, lineContent) {

                return that._updateCurrentInfomation(lineContent).then(function () {
                    var pos = editor.getCursorPositionScreen();
                    var $inputHolder = $(ref.getDOMNode());
                    var $input = $('.ace_text-input');
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
        if (doingLog) {
            var index = getLineIndex(content, doingLog.origin);
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
    },

    _initShortcut: function () {
        var that = this;
        Mt.bind('esc', function (e) {
        });
    },

    _initProjectTypeahead: function () {
        //var projects = [{name: 'life-time-tracker'}, {name: 'wa'}];
        var that = this;
        Ltt && Ltt.sdk.projects().then(function(projects) {
            that._createTypeahead('.ltt_c-logEditor-projects', '>', 'projects',
                projects.map(function (project) {
                    return _.pick(project, ['name', 'id']);
                })
            );
        });
    },

    _initVersionTypeahead: function () {
        var info = this._getCurrentLogInformation();
        var that = this;
        if (!info.projectId) { return; }
        Ltt.sdk.versions({projectId: info.projectId}).then(function (versions) {
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
            Ltt.sdk.tasks({projectId: info.projectId, versionId: info.versionId})
                .then(function (tasks) {
                    that._createTypeahead('.ltt_c-logEditor-tasks', ')', 'tasks',
                        tasks.map(function (task) {
                            return _.pick(task, ['name', 'id']);
                        })
                    );
                });
        }
    },

    _createTypeahead: function createTypeahead(selector, postfix, placeholder, datasets, callback) {
        var that = this;
        var $holder = $(selector).empty();
        $input = $('<input class="typeahead" type="text" placeholder="' + placeholder + '"/>');
        $holder.append($input);
        var projectTypeahead = $input.typeahead({
            hint: true,
            highlight: true,
            minLength: 1
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
            setTimeout(function () {
                that.editor.focus();
            }, 0);
            callback && callback(obj);
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

        console.log('shold update: ' + result);
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
        this.readLog(this.props.title)
            .then(function (content) {
                that.setValue(content);
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
        var that = this;
        var title = this.props.title;
        if (this.__saveing) { console.error('syncing'); return; }
        this.__saveing = true;
        NProgress.start();
        //write to local filesystem
        Ltt.sdk.writeLogFile(title, content).then(function () {
            that.props.onSave(content);
            NProgress.set(0.3);
            //import into database, for stat purpose
            Ltt.sdk.importLogContent(title, content).then(function () {
                NProgress.done();
                that.__saveing = false;
                //don't need to sync if already syncing.
                if (that.state.syncStatus === SYNCING) { return; }
                //start back up log file after log import successfully
                //may have change since the content may have changed
                //use the timer to optimize the performerce
                var timer = setTimeout(function () {
                    that.setState({syncStatus: SYNCING});
                    //init the project typeahead component again because the projects
                    that._initProjectTypeahead();
                    Ltt.sdk.backUpLogFile(title, content).then(function (result) {
                        console.error('done');
                        that.setState({syncStatus: NO_SYNC});
                    }).catch(function (err) {
                        console.error(err.stack);
                        that.setState({syncStatus: SYNC_ERROR});
                        Notify.error('Save to evernote failed' + err.message, {timeout: 3500});
                    });
                    clearTimeout(timer);
                }, 500);
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
                info.projectId = project.id;
            }
            if (version) {
                info.versionId = version.id;
            }
            if (task) {
                info.taskId = task.id;
            }
        }
        return info;
    },

    getDoingLog: function () {
        return this._doingLog;
    }
});

module.exports = LogEditor;