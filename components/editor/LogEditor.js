var React = require('react');
var store = require('store2');
var editorStore = store.namespace('LogEditor');
var contentCache = {};
//store key
var SK_CONTENT = 'content';
var Ltt = global.Ltt;
var Notify = require('../Notify');


var LogEditor = React.createClass({

    getInitialState: function () {
        return {
            syncing: false
        };
    },

    render: function () {
        var syncIcon = 'fa ';
        if (this.state.syncing) {
            syncIcon += 'fa-refresh fa-spin';
        } else {
            syncIcon += 'fa-upload';
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
        var title = this.props.title;
        var editor = ace.edit("ltt-logEditor");
        editor.setTheme("ace/theme/github");
        editor.getSession().setMode("ace/mode/ltt");
        //content = editorStore(SK_CONTENT);
        //editor.setValue(content);
        editor.on('change', function (e, editor) {
            var content = editor.getValue();
            editorStore(SK_CONTENT, content);
            //when content change, persist to file in hardware
            Ltt.sdk.writeLogFile(title, content).catch(function (err) {
                console.error(err.stack);
                Notify.error('Write file failed ', {timeout: 3500});
            });
        });
        editor.commands.addCommand({
            name: "import",
            bindKey: {win: "Ctrl-S", mac: "Command-S"},
            exec: function(editor) {
                that.save(editor.getValue());
            }
        });

        this.editor = editor;
        this.props.onLoad(editor);
    },

    save: function (content) {
        var that = this;
        var title = this.props.title;
        Ltt.sdk.writeLogFile(title, content).then(function () {
            Ltt.sdk.importLogContent(title, content).then(function () {
                Notify.success('Import success', {timeout: 700});
            }).catch(function () {
                Notify.error('Import failed', {timeout: 3500});
            });
            that.setState({syncing: true});
            Ltt.sdk.backUpLogFile(title, content).then(function (result) {
                console.log('update success from interface');
                that.setState({syncing: false});
            }).catch(function (err) {
                console.log(err);
                console.error(err.stack);
                that.setState({syncing: false});
                Notify.error('Save to evernote failed' + err.message, {timeout: 3500});
            });
        }).catch(function (err) {
            console.log(err);
            console.error(err.stack);
            Notify.error('Write file failed ', {timeout: 3500});
        });
    },

    setValue: function (content) {
        editorStore(SK_CONTENT, content);
        this.editor.setValue(content, -1);
        this.editor.focus();
    }
});

module.exports = LogEditor;