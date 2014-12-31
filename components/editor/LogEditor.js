var React = require('react');

var LogEditor = React.createClass({

    render: function () {
        return (
            <pre id="ltt-logEditor"></pre>
        );
    },

    componentDidMount: function () {
        var editor = ace.edit("ltt-logEditor");
        editor.setTheme("ace/theme/twilight");
        editor.getSession().setMode("ace/mode/ltt");
    }
});

module.exports = LogEditor;