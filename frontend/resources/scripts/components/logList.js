define(function(require) {
    'use strict';
    var React = require('react');
    var R = React.DOM;
    var Log = require('./log');

    var LogPage = React.createClass({
        displayName: 'logList',

        render: function() {
            var list = this.props.logs.map(function (log) {
                return Log(log);
            });
            return R.div({className: 'ltt_c-logList'}, list);
        }

    });

    return LogPage;
});
