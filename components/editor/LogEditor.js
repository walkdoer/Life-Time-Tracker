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
        this._initTypehead();
        this._initEditorCommand();
        this.readLog(this.props.title).then(function (content) {
            that.setValue(content);
            that.props.onLoad(content);
            that._listenToEditor();
        });
    },

    _listenToEditor: function () {
        var that = this;
        this.editor.on('change', _.debounce(function (e, editor) {
            console.log(e);
            var data = e.data;
            var title = that.props.title; //title can not be outside of this function scope,make sure that the title is the lastest.
            var content = editor.getValue();
            that.props.onChange(content, editor);
            //when content change, persist to file in hardware
            if (data && data.action === "insertText") {
                if (data.text === '<') {
                    openInput(that.refs.projects);
                    /*setTimeout(function () {
                        editor.insert('>');
                        pos = editor.getCursorPosition();
                        pos.column--;
                        editor.moveCursorToPosition(pos);
                    }, 0);*/
                } else if (data.text === '$') {
                    openInput(that.refs.versions)
                } else if (data.text === '(') {
                    openInput(that.refs.tasks);
                }
            }

            function openInput(ref) {
                var pos = editor.getCursorPositionScreen();
                var $inputHolder = $(ref.getDOMNode());
                $inputHolder.show().css({
                    top: 40 + 16 * pos.row,
                    left: 60 + 5 * pos.column
                });
                $inputHolder.find('.typeahead').focus();
            }
            if (!Ltt) {return;}
            Ltt.sdk.writeLogFile(title, content).catch(function (err) {
                console.error(err.stack);
                Notify.error('Write file failed ', {timeout: 3500});
            });
        }, 300));
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
            console.log('esc');
        });
    },

    _initTypehead: function () {
        var projects = [{name: 'life-time-tracker'}, {name: 'wa'}];
        var that = this;
        Ltt && Ltt.sdk.projects().then(function(projects) {
            console.log(projects);
            createTypeahead('.ltt_c-logEditor-projects', '>', 'projects',
                projects.map(function (project) {
                    return _.pick(project, ['name', '_id']);
                }),
                function (project) {
                    console.log(project);
                    var projectId = project._id;
                    Ltt.sdk.versions({projectId: projectId}).then(function (versions) {
                        createTypeahead('.ltt_c-logEditor-versions', '$', 'versions', versions.map(function (version) {
                            return _.pick(version, ['name', '_id']);
                        }), function (version) {
                            console.log(version);
                            var versionId = version._id;
                            Ltt.sdk.tasks({projectId: projectId, versionId: versionId})
                                .then(function (tasks) {
                                    createTypeahead('.ltt_c-logEditor-tasks', ')', 'tasks', tasks.map(function (task) {
                                        return _.pick(task, ['name', '_id']);
                                    }));
                                });
                        });
                    });
                }
            );
        });

        function createTypeahead(selector, postfix, placeholder, datasets, callback) {
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
        }
        /*
        createTypeahead('.ltt_c-logEditor-projects', '>', 'projects',
            [{name: 'life-time-tracker', _id: 123123}].map(function (project) {
                return _.pick(project, ['name', '_id']);
            }),
            function (item) {
                createTypeahead('.ltt_c-logEditor-versions', '$', 'versions', [{name: '1.0.2'}].map(function (version) {
                    return _.pick(version, ['name', '_id']);
                }), function (version) {
                    console.log(version);
                    createTypeahead('.ltt_c-logEditor-tasks', '(', 'tasks', [{name: 'andrew rebone'}].map(function (task) {
                        return _.pick(task, ['name', '_id']);
                    }));
                });
            }
        );*/
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
                            _id: item._id
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

    componentWillUpdate: function () {
        //get the editor position
        this.currentPosition = this.editor.getCursorPosition();
    },

    componentDidUpdate: function () {
        var that = this;
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
                console.log(content);
                return content;
            })
            .catch(function (err) {
                Notify.error('Open log content failed', {timeout: 3500});
            });
    },


    save: function (content) {
        var that = this;
        var title = this.props.title;
        console.log('######', title, content);
        NProgress.start();
        //write to local filesystem
        Ltt.sdk.writeLogFile(title, content).then(function () {
            that.props.onSave(content);
            NProgress.set(0.3);
            //import into database, for stat purpose
            Ltt.sdk.importLogContent(title, content).then(function () {
                NProgress.done();
                //start back up log file after log import successfully
                that.setState({syncStatus: SYNCING});
                Ltt.sdk.backUpLogFile(title, content).then(function (result) {
                    that.setState({syncStatus: NO_SYNC});
                }).catch(function (err) {
                    console.error(err.stack);
                    that.setState({syncStatus: SYNC_ERROR});
                    Notify.error('Save to evernote failed' + err.message, {timeout: 3500});
                });
            }).catch(function () {
                NProgress.done();
                Notify.error('Import failed', {timeout: 3500});
            });
        }).catch(function (err) {
            console.log(err);
            NProgress.done();
            console.error(err.stack);
            Notify.error('Write file failed ', {timeout: 3500});
        });
    }
});

module.exports = LogEditor;