var React = require('react');
var R = React.DOM;
var Moment = require('moment');
var _ = require('lodash');

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

        var baseClassName = 'ltt_c-log',
            classCode = getLogClassCode(this.props.classes),
            className = [baseClassName, inheritClassName(baseClassName, classCode)].join(' ');
        return R.div(
            { className: className, style: getLogInlineStyle(this.props)},
            Time({ value: this.props.start, type: 'date'}),
            Time({ value: this.props.start, type: 'time'}),
            Time({ value: this.props.end, type: 'time'}),
            LogClass({value: this.props.classes}),
            Origin({value: this.props.origin})
        );

        function inheritClassName (base, prop) {
            return base + '__' + prop;
        }

        function getLogClassCode(classes) {
            if (!_.isEmpty(classes)) {
                return classes[0].code
            } else {
                return '';
            }
        }
    }

});

function getLogInlineStyle(log) {
    return {
        //height: getHeightByTimeRange(log.start, log.end)
    };

    function getHeightByTimeRange(start, end) {
        var minHeight = 28,
            minPerHeight = 3; //1 minute = 5px
        var mStart = new Moment(start),
            mEnd = new Moment(end);

        var time = mEnd.diff(mStart, 'minute');
        if (time > 0) {
            return (time - 1) * minPerHeight + minHeight;
        } else if (time === 0) {
            return minHeight;
        } else {
            return 0;
        }
    }
}
module.exports = Log;