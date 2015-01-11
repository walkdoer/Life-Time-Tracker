var React = require('react');
var store = require('store2');
var editorStore = store.namespace('LogEditor');
var contentCache = {};
//store key
var SK_CONTENT = 'content';
var Ltt = global.Ltt;
var Notify = require('../Notify');

var NProgress = require('nprogress');
var NO_SYNC = 1, SYNCING = 2, SYNC_ERROR = 3;

var LogEditor = React.createClass({

    getDefaultProps: function () {
        return {
            onLoad: function () {}
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
                <pre id="ltt-logEditor"></pre>
            </div>
        );
    },

    componentDidMount: function () {
        var that = this;
        var editor = ace.edit("ltt-logEditor");
        editor.setTheme("ace/theme/github");
        editor.getSession().setMode("ace/mode/ltt");
        //content = editorStore(SK_CONTENT);
        //editor.setValue(content);
        editor.on('change', function (e, editor) {
            var title = that.props.title; //title can not be outside of this function scope,make sure that the title is the lastest.
            var content = editor.getValue();
            editorStore(SK_CONTENT, content);
            //when content change, persist to file in hardware
            Ltt.sdk.writeLogFile(title, content).catch(function (err) {
                console.error(err.stack);
                Notify.error('Write file failed ', {timeout: 3500});
            });
        });

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
        })

        this.editor = editor;
        this.props.onLoad(editor);
        this.readLog(this.props.title);
    },

    componentWillUpdate: function () {
        //get the editor position
        this.currentPosition = this.editor.getCursorPosition();
    },

    componentDidUpdate: function () {
        this.readLog(this.props.title);
    },

    readLog: function (title) {
        var editor = this.editor;
        if (!Ltt) { return; }
        var pos = this.currentPosition;
        Ltt.sdk.readLogContent(title)
            .then(function (content) {
                editor.setValue(content, -1);
                if (pos) {
                    editor.moveCursorToPosition(pos);
                }
            })
            .catch(function (err) {
                Notify.error('Open log content failed', {timeout: 3500});
            });
    },


    save: function (content) {
        var that = this;
        var title = this.props.title;
        NProgress.start();
        //write to local filesystem
        Ltt.sdk.writeLogFile(title, content).then(function () {
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