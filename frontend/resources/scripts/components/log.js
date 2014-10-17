define(function(require) {
    'use strict';
    var React = require('react');
    var R = React.DOM;
    var Moment = require('moment');
    var _ = require('underscore');

    var Time = React.createClass({
        displayName: 'time',

        render: function() {
            var value = this.props.value,
                type = this.props.type,
                m = new Moment(value);
            var format = {
                time: 'HH:mm',
                date: 'YYYY-MM-DD'
            }[type] || 'YYYY-MM-DD HH:mm:ss';
            var timeStr = m.format(format);

            return R.span({className: 'ltt_c-log-' + type}, timeStr);
        }
    });

    var Origin = React.createClass({
        render: function () {
            return R.i({className: 'ltt_c-log-origin'}, this.props.value);
        }
    });


    var LogClass = React.createClass({
        render: function () {
            var classes = this.props.value;
            if (!_.isArray(classes)) {
                classes = [classes];
            }

            classes = classes.map(function(cls) {
                return R.li({
                    className: 'ltt_c-log-class-item',
                    'data-code': cls.code
                }, cls.name);
            });
            return R.ul({className: 'ltt_c-log-class'}, classes);
        }
    });

    var Log = React.createClass({
        displayName: 'log',

        render: function() {
            return R.div(
                { className: 'ltt_c-log' },
                Time({ value: this.props.start, type: 'date'}),
                Time({ value: this.props.start, type: 'time'}),
                Time({ value: this.props.end, type: 'time'}),
                LogClass({value: this.props.classes}),
                Origin({value: this.props.origin})
            );
        }

    });

    return Log;
});
