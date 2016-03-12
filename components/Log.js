var React = require('react');
var cx = React.addons.classSet;
var R = React.DOM;
var Moment = require('moment');
var _ = require('lodash');
var Tag = require('./Tag');
var Progress = require('./Progress');
var Router = require('react-router');
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
        return (<p className='ltt_c-log-origin'>{this.props.value}</p>);
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
                key: cls,
                className: 'ltt_c-log-class-item',
                'data-code': cls
            }, cls.name);
        });
        return R.ul({className: 'ltt_c-log-class'}, classes);
    }
});

var Log = React.createClass({

    displayName: 'log',

    mixins: [Router.Navigation],

    getDefaultProps: function () {
        return {
            showDate: true,
            showTime: true,
            showProgress: true,
            showProject: true,
            showDetail: false
        };
    },

    getInitialState: function () {
        return {
            showDetail: this.props.showDetail
        }
    },

    render: function() {

        var baseClassName = 'ltt_c-log',
            classCode = getLogClassCode(this.props.classes),
            signs = this.props.signs;
        var className = baseClassName;
        if (classCode) {
            className += ' ' + inheritClassName(baseClassName, classCode);
        }
        if (signs.indexOf('wake') >=0 ) {
            className += ' ' + inheritClassName(baseClassName, 'wake');
        }
        if (signs.indexOf('sleep') >= 0) {
            className += ' ' + inheritClassName(baseClassName, 'sleep');
        }
        var tags = this.props.tags;
        if (!_.isEmpty(tags)) {
            tags = tags.map(function (tag) {
                return (<Tag>{tag}</Tag>);
            });
        }
        var project = this.props.project;
        if (_.isObject(project) && this.props.showProject) {
            if (_.isObject(project.version)) {
                var version = (<span className="ltt_c-log-project-version">{project.version}</span>);
            } else {
                version = null;
            }
            project = (
                <span className="ltt_c-log-project">
                    <a href="#">
                        <i className="fa fa-rocket"></i>
                        <span className="ltt_c-log-project-name">{project.name}</span>
                        {version}
                    </a>
                </span>
            );
        } else {
            project = null;
        }
        var task = this.props.task;
        if (_.isObject(task)) {
            task = (
                <span className="ltt_c-log-task"><i className="fa fa-tasks"></i>{task.name}</span>
            );
        } else {
            task = null;
        }
        var progress = this.props.progress;

        if (progress) {
            progress = <Progress max={100} value={progress.subTask || progress.task}/>
        }

        var detail = <div class="ltt_c-log-detail">
            <LogClass value={this.props.classes}/>
            {project}
            {task}
            {tags}
        </div>
        return (
            <div className={className}  style={getLogInlineStyle(this.props)}>
                <span className="ltt_c-log-detailToggler" onClick={this.toggleDetail}>
                    <i className={cx({
                        fa: true,
                        'fa-angle-down': this.state.showDetail,
                        'fa-angle-up': !this.state.showDetail
                    })}></i>
                </span>
                {this.props.showDate ? <Time value={this.props.start} type='date'/> : null}
                {this.props.showTime ? <Time value={this.props.start} type='time'/> : null }
                {this.props.showTime ? <Time value={this.props.end} type='time'/> : null }
                <i className="ltt_c-log-gotoEditor fa fa-external-link" onClick={this.gotoEditor}></i>
                {this.props.showProgress ? progress : null}
                <span className="ltt_c-log-len">{getTimeLength(this.props.len)}</span>
                {this.state.showDetail ? detail : null}
                <Origin value={this.props.content}/>
            </div>
        );

        function inheritClassName (base, prop) {
            return base + '__' + prop;
        }

        function getLogClassCode(classes) {
            if (!_.isEmpty(classes)) {
                return classes[0];
            } else {
                return '';
            }
        }
        function getTimeLength(val) {
            if (val < 60) {
                return val + ' minutes';
            } else {
                return (val / 60).toFixed(1) + ' hours';
            }
        }
    },

    toggleDetail: function () {
        this.setState({
            showDetail: !this.state.showDetail
        });
    },

    gotoEditor: function (e) {
        var date = this.props.date;
        console.log('goto editor');
        location.hash = '/logEditor/' + date + '?logOrigin=' +  encodeURIComponent(this.props.origin);
        //this.transitionTo('logEditor', {date: date}, {logOrigin: this.props.origin});
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