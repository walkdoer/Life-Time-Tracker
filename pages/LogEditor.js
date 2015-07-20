/**
 * @jsx React.DOM
 */

var React = require('react');
var $ = require('jquery');
var numeral = require('numeral');
var Router = require('react-router');
var Mt = window.Mousetrap;
var _ = require('lodash');
require('../libs/bootstrap-datepicker');
var PureRenderMixin = require('react/addons').addons.PureRenderMixin;
var ReactBootStrap = require('react-bootstrap');
var Modal = ReactBootStrap.Modal;
var ModalTrigger = ReactBootStrap.ModalTrigger;
var ButtonToolbar = ReactBootStrap.ButtonToolbar;
var Button = ReactBootStrap.Button;
var Link = Router.Link;

/* Components */
var Moment = require('moment');
var LogEditor = require('../components/editor/LogEditor');
var SearchBox = require('../components/SearchBox');
var Moment = require('moment');
var Notify = require('../components/Notify');
var Progress = require('../components/Progress');
var DataAPI = require('../utils/DataAPI');
var BindStore = require('../mixins/BindStore');
var LogClassPie = require('../components/LogClassPie');


/** Store */
var ProjectStore = require('../stores/ProjectStore');

/** Constants */
var EVENT = require('../constants/EventConstant');

/** Utils */
var Bus = require('../utils/Bus');
var DataAPI = require('../utils/DataAPI');


var Ltt = global.Ltt;
var DATE_FORMAT = 'YYYY-MM-DD';



var Page = React.createClass({

    mixins: [PureRenderMixin, Router.State, Router.Navigation],

    getInitialState: function () {
        var params = this.getParams();
        var query = this.getQuery();
        this._initOrigin = query.logOrigin;
        var date;
        if (params && params.date) {
            date = new Moment(params.date).format(DATE_FORMAT);
        } else {
            date = new Moment().format(DATE_FORMAT);
        }
        return {
            current: date,
            projects: []
        };
    },

    componentWillReceiveProps: function (nextProps) {
        var params = this.getParams();
        var date;
        if (params && params.date) {
            date = new Moment(params.date).format(DATE_FORMAT);
        } else {
            date = new Moment().format(DATE_FORMAT);
        }
        this.setState({
            current: date
        });
    },

    render: function () {
        var days = this.state.days;
        console.log('########render');
        return (
            <div className="ltt_c-page ltt_c-page-logEditor">
                <LogEditor title={this.state.current}
                    onNextDay={this.gotoNextDay}
                    onPrevDay={this.gotoPrevDay}
                    onGotoToday={this.gotoToday}
                    onCtrlO={this.openGotoDayWindow}
                    onChange={this.onChange}
                    onLineChange={this.onLineChange}
                    onLoad={this.onEditorLoad}
                    onSave={this.onSave}
                    locate={this._initOrigin}
                    ref="logEditor"/>
                <aside>
                    <LogDatePicker select={this.state.current}
                        onDateChange={this.onDateChange}
                        ref="datePicker"/>
                    <ModalTrigger modal={<DateGoToWindow onGoto={this.gotoDate}/>} ref="dateGoToWindow"><span></span></ModalTrigger>
                    <LogClassPie date={this.state.current} backgroundColor="#f6f6f6" ref="logClassPie"/>
                    <ButtonToolbar>
                        <Button bsSize='xsmall'><Link to="/reports/today">More Detail</Link></Button>
                    </ButtonToolbar>
                    <div className="overtimeLog" ref="overtimeLog"></div>
                    <TaskInfo ref="taskInfo"/>
                </aside>
            </div>
        );
    },

    /*renderOverTimeLog: function (allLogs) {
        var overtimeLogs = this.getOverTimeLog(allLogs);
        if (_.isEmpty(overtimeLogs)) {
            return;
        }
        React.renderComponent(
            <div>
                {logs.map(function () {return <OvertimeLog log={log}/>})}
            </div>,
            this.refs.overtimeLog.getDOMNode());
    },

    getOverTimeLog: function (logs) {
        if (!logs) {return [];}
        return logs.filter(function (log) {
            return log.len > log.estimatedTime;
        });
    },*/

    componentWillMount: function () {
        var that = this;
        Mt.bind(['command+\'', 'ctrl+\''], function (e) {
            e.preventDefault();
            that.gotoToday();
        });
        Mt.bind(['command+o', 'ctrl+o'], function (e) {
            e.preventDefault();
            that.openGotoDayWindow();
        });
    },

    componentWillUnmount: function () {
        Mt.unbind(['command+\'', 'ctrl+\'']);
    },

    onDateChange: function (date) {
        date = new Moment(date).format(DATE_FORMAT)
        this.setState({
            current: date
        });
        this.transitionTo('logEditor', {date: date});
    },

    gotoPrevDay: function () {
        var prevDay = new Moment(this.state.current).subtract(1, 'day')
        this.setState({
            current: prevDay.format(DATE_FORMAT)
        });
        this.transitionTo('logEditor', {date: prevDay.format(DATE_FORMAT)});
    },

    gotoNextDay: function () {
        var next = new Moment(this.state.current).add(1, 'day')
        this.setState({
            current: next.format(DATE_FORMAT)
        });
        this.transitionTo('logEditor', {date: next.format(DATE_FORMAT)});
    },

    gotoToday: function () {
        var today = new Moment().format(DATE_FORMAT)
        console.log('goto today', today);
        this.setState({
            current: today
        });
        this.transitionTo('logEditor', {date: today});
    },

    gotoDate: function (date) {
        date = new Moment(date).format(DATE_FORMAT)
        this.setState({
            current: date
        });
        this.transitionTo('logEditor', {date: date});
    },

    openGotoDayWindow: function () {
        this.refs.dateGoToWindow.show();
    },


    onChange: function (content) {
        console.log('change and fire doingLog');
        var doingLog = this.refs.logEditor.getDoingLog(content);
        Bus.emit(EVENT.DOING_LOG, doingLog);
        Bus.emit(EVENT.LOG_CHANGE, this.state.current, content);
    },

    onLineChange: function (line, log) {
        Bus.emit(EVENT.CURRENT_LOG, log);
    },

    onSave: function (content) {
        var that = this;
        this.refs.logClassPie.update();
        this.refs.logEditor.getUnfinishLog(
            new Moment().startOf('day').toDate(),
            new Moment().endOf('day').toDate()
        ).then(function (unfinishLogs) {
            that.refs.taskInfo.update({
                unfinishAmount: unfinishLogs.length
            });
        });
        Bus.emit(EVENT.UPDATE_APP_INFO);
        Bus.emit(EVENT.LOG_CHANGE, this.state.current, content);
        //Bus.emit(EVENT.CHECK_SYNC_STATUS);
    },

    onEditorLoad: function (content, doingLog) {
        console.log('loaded and fire doingLog');
        Bus.emit(EVENT.DOING_LOG, doingLog);
        if (doingLog) {
            Bus.emit(EVENT.CURRENT_LOG, doingLog);
        }
    }
});


var TaskInfo = React.createClass({

    getInitialState: function () {
        return {
            finishAmount: null,
            unfinishAmount: null
        };
    },

    render: function () {
        return (
            <div className="ltt_c-page-logEditor-taskInfo">
                { this.state.finishAmount > 0 ? <p>Finish task: {this.state.finishAmount}</p> : null }
                { this.state.unfinishAmount > 0 ? <p>Unfinish logs: {this.state.unfinishAmount}</p> : null }
            </div>
        )
    },

    update: function (data) {
        this.setState(_.pick(data, ['finishAmount', 'unfinishAmount']));
    }
});


var DateGoToWindow = React.createClass({

    getDefaultProps: function () {
        return {
            onGoto: function () {}
        }
    },

    getInitialState: function () {
        return {
            date: ''
        };
    },

    render: function () {
        var inputBoxStyle = {'text-indent': '10px', 'padding': '2px 10px 2px 0'};
        return (
            <Modal {...this.props} title="Goto any day" bsStyle="primary" animation={false}>
                <div className="modal-body">
                  <input type="text" placeholder="YYYY-MM-DD" value={this.state.value} style={inputBoxStyle}
                    ref="input" onChange={this.onDateChange} onKeyDown={this.onKeyDown}/>
                </div>
                <div className="modal-footer">
                  <Button onClick={this.props.onRequestHide}>Close</Button>
                  <Button bsStyle="primary" onClick={this.goto}>Goto</Button>
                </div>
            </Modal>
        );
    },

    onDateChange: function (e) {
        this.setState({
            date: e.target.value
        });
    },

    onKeyDown: function (e) {
        var ENTER = 13;
        if( e.keyCode == ENTER ) {
            this.goto();
        }
    },

    componentDidMount: function () {
        $(this.refs.input.getDOMNode()).focus();
    },

    goto: function () {
        var dateStr = this.state.date;
        var dateArr = dateStr.split('-');
        var date;
        //user only input a day
        if (dateArr.length === 1) {
            date = new Moment().date(dateArr);
        } else if (dateArr.length === 2){
            date = new Moment().month(parseInt(dateArr[0], 10) - 1).date(dateArr[1]);
        } else {
            date = new Moment(dateStr);
        }
        if (date.isValid()) {
            this.props.onGoto(date.toDate());
            this.props.onRequestHide();
        }
    }

})

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


var ProjectInfo = React.createClass({

    mixins: [BindStore(ProjectStore)],

    getInitialState: function () {
        return {
            projects: []
        };
    },

    componentWillReceiveProps: function (nextProps) {
        var date = nextProps.date;
        if (date !== this.props.date) {
            DataAPI.getProjects({
                start: date,
                end: date
            });
        }
    },

    render: function () {
        var projects = this.state.projects;
        var date = this.props.date;
        return (
            <div className="ltt_c-projectInfo">
                {projects.map(function (project) {
                    return (
                        <div className="ltt_c-projectInfo-project">
                            <div className="ltt_c-projectInfo-project-header">
                                <div className="ltt_c-projectInfo-title">
                                    <Link to={'/projects/' + project._id}>{project.name}</Link>
                                </div>
                                <Progress max={100} value={project.progress}/>
                            </div>
                            <TaskDetail tasks={project.lastTasks} date={date}/>
                        </div>
                    );
                })}
            </div>
        );
    },

    componentDidMount: function () {
        var date = this.props.date;
        DataAPI.getProjects({
            start: date,
            end: date
        });
    },

    getStateFromStores: function () {
        return {
            projects: ProjectStore.getData()
        };
    },

});


var TaskDetail = React.createClass({
    getDefaultProps: function () {
        return {
            tasks: []
        };
    },

    render: function () {
        var className = 'ltt_c-taskInfo '
        if (this.props.className) {
             className += this.props.className;
        }
        var tasks = this.props.tasks;
        var date = this.props.date;
        if (date) {
            tasks = tasks.filter(function (task) {
                var lastActiveTime = new Moment(task.lastActiveTime);
                if (lastActiveTime.format('YYYY-MM-DD') === date) {
                    if (_.isEmpty(task.subTasks)) { return true; }
                    task.subTasks = task.subTasks.filter(function (task) {
                        var lastActiveTime = new Moment(task.lastActiveTime);
                        return lastActiveTime.format('YYYY-MM-DD') === date;
                    });
                    return true;
                } else {
                    return false;
                }
            });
        }
        return (
            <div className={className}>
                {tasks.map(function (task) {
                    return (
                        <div className="ltt_c-taskInfo-task">
                            <div className="ltt_c-taskInfo-task-header">
                                <div className="ltt_c-taskInfo-task-title">
                                    {task.name}
                                </div>
                                <Progress max={100} value={task.progress}/>
                            </div>
                            <TaskDetail className="subtask" tasks={task.subTasks} date={date}/>
                        </div>
                    );
                })}
            </div>
        )
    }
})


/*
<div className="ltt_c-sidebar-splitline">Projects</div>
                    <ProjectInfo date={this.state.current}/>
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

var OvertimeLog = React.createClass({

    render: function () {
        var log = this.props.log;
        var estimatedTime = log.estimatedTime;
        var realTime = log.len
        var isOvertime = realTime > estimatedTime;
        return <div className={cx({
            "ltt_c-OvertimeLog": true,
            "real": }>
            {displayTime(realTime)}/{displayTime(estimatedTime)}
        </div>
    }
});

function displayTime(timeAmount) {
    return Moment.duration(timeAmount, "minutes").format("M[m],d[d],h[h],mm[min]")
}
})*/




module.exports = Page;
