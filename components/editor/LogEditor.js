var React = require('react');
var store = require('store2');
var editorStore = store.namespace('LogEditor');
var contentCache = {};
//store key
var SK_CONTENT = 'content';
var LogEditor = React.createClass({

    render: function () {
        return (
            <div className="ltt_c-logEditor">
                <div className="ltt_c-logEditor-title">{this.props.title}</div>
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
            var content = editor.getValue();
            editorStore(SK_CONTENT, content);
        });
        editor.commands.addCommand({
            name: "import",
            bindKey: {win: "Ctrl-S", mac: "Command-S"},
            exec: function(editor) {
                that.props.onImport(editor.getValue());
            }
        });

        this.editor = editor;
        this.props.onLoad(editor);
    },

    setValue: function (content) {
        editorStore(SK_CONTENT, content);
        this.editor.setValue(content, -1);
        this.editor.focus();
    }
});

module.exports = LogEditor;