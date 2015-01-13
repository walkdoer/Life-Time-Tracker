/**
 * @jsx React.DOM
 */

var React = require('react');
var $ = require('jquery');
require('../libs/bootstrap-datepicker');
var remoteStorage = require('../components/storage.remote');
var Moment = require('moment');
var LogEditor = require('../components/editor/LogEditor');
var SearchBox = require('../components/SearchBox');
var Moment = require('moment');
var Notify = require('../components/Notify');
var SetIntervalMixin = require('../components/mixins/setInterval');
var numeral = require('numeral');

var Ltt = global.Ltt;

var DATE_FORMAT = 'YYYY-MM-DD';


var Page = React.createClass({

    mixins: [SetIntervalMixin],

    getInitialState: function () {
        return {
            current: new Moment().format(DATE_FORMAT)
        };
    },

    render: function () {
        var days = this.state.days;
        console.log('########render');
        return (
            <div className="ltt_c-page ltt_c-page-logEditor">
                <LogEditor title={this.state.current}
                    onNextDay={this.openNextDay}
                    onPrevDay={this.openPrevDay}
                    onSave={this.onSave}
                    onLoad={this.onEditorLoad}
                    ref="logEditor"/>
                <aside>
                    <LogDatePicker select={this.state.current}
                        onDateChange={this.onDateChange}
                        ref="datePicker"/>
                    <div className="lastTime" ref="lastTime"></div>
                </aside>
            </div>
        );
    },

    onDateChange: function (date) {
        console.log('date change');
        date = new Moment(date).format(DATE_FORMAT)
        this.setState({
            current: date
        });
    },

    openPrevDay: function () {
        var prevDay = new Moment(this.state.current).subtract(1, 'day')
        this.setState({
            current: prevDay.format(DATE_FORMAT)
        });
    },

    openNextDay: function () {
        var next = new Moment(this.state.current).add(1, 'day')
        this.setState({
            current: next.format(DATE_FORMAT)
        });
    },

    onSave: function (content) {
        var doingLog = Ltt.sdk.getDoingLog(this.state.current, content);
        if (doingLog) {
            this.updateLastTime(doingLog);
        }
    },

    onEditorLoad: function (content) {
        var doingLog = Ltt.sdk.getDoingLog(this.state.current, content);
        if (doingLog) {
            this.updateLastTime(doingLog);
        }
    },

    updateLastTime: function (doingLog) {
        var lastTime = this.refs.lastTime.getDOMNode();
        if (this.updateTimeIntervalId) {
            this.clearInterval(this.updateTimeIntervalId);
        }
        this.updateTimeIntervalId = this.setInterval(function () {
            var content;
            if (doingLog) {
                var lastSeconds = new Moment().diff(new Moment(doingLog.start), 'second');
                var task = doingLog.task,
                    project = doingLog.projects[0],
                    subTask = doingLog.subTask;
                if (project) {
                    name = project.name
                }
                if (task) {
                    name += ' ' + task.name;
                }
                if (subTask) {
                    name += ' ' + subTask.name;
                }
                content = (
                    <div className="ltt_c-lastTime">
                        <span className="ltt_c-lastTime-name">{name}</span>
                        <span className="ltt_c-lastTime-time">{numeral(lastSeconds).format('00:00:00')}</span>
                    </div>
                );
            } else {
                content = <i></i>;
            }
            React.renderComponent(content, lastTime);
        }, 1000);
    }
});

var LogDatePicker = React.createClass({
    render: function () {
        return (
            <div className="ltt_c-page-logEditor-datepicker"></div>
        );
    },

    setDate: function (date) {
        $(this.getDOMNode()).datepicker('setDate', this.props.select);
    },

    componentDidMount: function () {
        var onDateChange = this.props.onDateChange;
        $(this.getDOMNode())
        .datepicker({
            todayHighlight: true,
            format: "yyyy-mm-dd",
            calendarWeeks: true
        })
        .on('changeDate', function (e) {
            var date = e.date;
            onDateChange(date);
        }).datepicker('setDate', this.props.select, false);
    },

    componentDidUpdate: function () {
        console.log('update');
        $(this.getDOMNode()).datepicker('setDate', this.props.select, false);
    }
});


var FilterableList = React.createClass({

    getDefaultProps: function () {
        return {
            items: []
        };
    },
    render: function () {
        var select = this.props.select;
        var items = this.props.items;
        return (
            <div className="ltt_c-filterableList">
                <SearchBox placeholder="search here"/>
                <div className="ltt_c-filterableList-list scrollable">
                {items.map(function (item) {
                    var selected = item.key === select;
                    return (<ListItem {...item} selected={selected} onClick={this.props.onItemClick}/>)
                }, this)}
                </div>
            </div>
        );
    }
});

var ListItem = React.createClass({
    render: function () {
        var className = "ltt_c-filterableList-list-item";
        if (this.props.selected) {
            className = className + ' selected';
        }
        return (
            <div className={className} onClick={this.onClick}>
                <div className="ltt_c-filterableList-list-item-name">{this.props.name}</div>
            </div>
        );
    },

    onClick: function (e) {
        this.props.onClick(e, this.props);
    }
})


module.exports = Page;
