var React = require('react');
var store = require('store2');
var editorStore = store.namespace('LogEditor');

//store key
var SK_CONTENT = 'content';
var LogEditor = React.createClass({

    render: function () {
        return (
            <pre id="ltt-logEditor"></pre>
        );
    },

    componentDidMount: function () {
        var that = this;
        var editor = ace.edit("ltt-logEditor");
        editor.setTheme("ace/theme/github");
        editor.getSession().setMode("ace/mode/ltt");
        content = editorStore(SK_CONTENT);
        editor.setValue(content);
        editor.on('change', function (e, editor) {
            var content = editor.getValue();
            console.log(content);
            editorStore(SK_CONTENT, content);
        });
        editor.commands.addCommand({
            name: "import",
            bindKey: {win: "Ctrl-S", mac: "Command-Shift-S"},
            exec: function(editor) {
                that.props.onImport(editor.getValue());
            }
        })
    }
});

module.exports = LogEditor;