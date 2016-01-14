/**
 * @jsx React.DOM
 */

var React = require('react');
var $ = require('jquery');
require('../../libs/bootstrap-datepicker');
var Moment = require('moment');
var _ = require('lodash');
require("datetimepicker");
var RB = require('react-bootstrap');
var Row = RB.Row;
var Col = RB.Col;
var Button = RB.Button;
var OverlayTrigger = RB.OverlayTrigger;
var Tooltip = RB.Tooltip;

/**components*/
var Log = require('../Log');
var LoadingMask = require('../LoadingMask');
var Notify = require('../Notify');
var LogLine = require('../charts/LogLine');

/** Utils */
var DataAPI = require('../../utils/DataAPI');
var DATE_FORMAT = 'YYYY-MM-DD HH:mm:ss';
var DATE_TIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';
var noop = function () {};

module.exports = React.createClass({

    getInitialState: function () {
        var task = this.props.task;
        return {
            loaded: false,
            estimatedTime: task ? task.estimatedTime : null,
            logs: [],
            task: task
        };
    },

    getDefaultProps: function () {
        return {
            onHidden: noop,
            onLogsLoaded: noop,
            onChange: noop
        };
    },

    render: function () {
        var task = this.state.task;
        var lastActiveTimeToolTip;
        if (task.lastActiveTime) {
            lastActiveTimeToolTip = <Tooltip>{new Moment(task.lastActiveTime).format(DATE_TIME_FORMAT)}</Tooltip>;
        }
        return (
            <div className="ltt_c-projectTask-logs ltt_c-taskDetail" onClick={function (e) {e.stopPropagation();}}>
                <div className="ltt_c-LogList" key={task._id}>
                    <div className="ltt_c-LogList-header">
                        <span className="searchInput">{task.name}</span>
                        <span className="closeWindow" onClick={this.hide} title="close">
                            <i className="fa fa-close"></i>
                        </span>
                    </div>
                    <div className="ltt_c-taskDetail-dateInfo">
                        <Row className="ltt_c-taskDetail-dateInfo-item">
                            <Col xs={6} className="ltt_c-taskDetail-dateInfo-item-label" md={4}>Estimated</Col>
                            <Col xs={12} className="ltt_c-taskDetail-dateInfo-item-input" md={8}>
                                <input type="text" name="estimatedTime" ref="estimatedTime"
                                    onKeyDown={this.onEstimatedTimeKeyDown}
                                    onChange={this.updateEstimatedTime}
                                    value={buildTime(this.state.estimatedTime)}/>
                            </Col>
                        </Row>
                        <Row className="ltt_c-taskDetail-dateInfo-item">
                            <Col xs={6} className="ltt_c-taskDetail-dateInfo-item-label" md={4}>Defer until</Col>
                            <Col xs={12} className="ltt_c-taskDetail-dateInfo-item-input" md={8}>
                                <DateTimePicker name="deferUntil" ref="deferUntil" onChange={this.updateTime} value={task.deferUntil}/>
                            </Col>
                        </Row>
                        <Row className="ltt_c-taskDetail-dateInfo-item">
                            <Col xs={6} className="ltt_c-taskDetail-dateInfo-item-label" md={4}>Complete</Col>
                            <Col xs={12} className="ltt_c-taskDetail-dateInfo-item-input" md={8}>
                                <DateTimePicker name="completeTime" ref="completeTime" onChange={this.updateTime} value={task.completeTime}/>
                            </Col>
                        </Row>
                        <Row className="ltt_c-taskDetail-dateInfo-item">
                            <Col xs={6} className="ltt_c-taskDetail-dateInfo-item-label" md={4}>Due Time</Col>
                            <Col xs={12} className="ltt_c-taskDetail-dateInfo-item-input" md={8}>
                                <DateTimePicker name="dueTime" ref="dueTime" onChange={this.updateTime} value={task.dueTime}/>
                            </Col>
                        </Row>
                        <Row className="ltt_c-taskDetail-dateInfo-item">
                            <Col xs={6} className="ltt_c-taskDetail-dateInfo-item-label" md={4}>Created</Col>
                            <Col xs={12} className="ltt_c-taskDetail-dateInfo-item-input" md={8}>
                                <OverlayTrigger placement="bottom"
                                        overlay={<Tooltip>{new Moment(task.createTime).format(DATE_TIME_FORMAT)}</Tooltip>}
                                        delay={10}
                                        delayHide={300}
                                    >
                                        <span>{new Moment(task.createTime).fromNow()}</span>
                                    </OverlayTrigger>
                            </Col>
                        </Row>
                        {
                            task.lastActiveTime ?
                            <Row className="ltt_c-taskDetail-dateInfo-item">
                                <Col xs={6} className="ltt_c-taskDetail-dateInfo-item-label" md={4}>Update</Col>
                                <Col xs={12} className="ltt_c-taskDetail-dateInfo-item-input" md={8}>
                                    <OverlayTrigger placement="bottom"
                                        overlay={lastActiveTimeToolTip}
                                        delay={10}
                                        delayHide={300}>
                                    <span>{new Moment(task.lastActiveTime).fromNow()}</span>
                                    </OverlayTrigger>
                                    <Button bsStyle="warning" bsSize="xsmall" style={{marginLeft: 10}} onClick={this.correctLastActiveTime}>correct</Button>
                                </Col>
                            </Row> : null
                        }
                    </div>
                    {!_.isEmpty(this.state.logs) ? <LogLine logs={this.state.logs} isSubTask={!!task.parent} withProgress={true} name={task.name}/> : null}
                    {this.renderLogs()}
                    <LoadingMask loaded={this.state.loaded}/>
                </div>
            </div>
        );
    },

    renderLogs: function () {
        return <div className="ltt_c-taskDetail-logs">{this.state.logs.map(function (log, index) {
            return <Log {... log}/>;
        })}</div>
    },

    updateTime: function (timeInfo) {
        var name = timeInfo.name;
        var date = timeInfo.date;
        var changedValue = {id: this.props.task._id};
        var that = this;
        changedValue[name] = date;
        DataAPI.Task.update(changedValue).then(function(result) {
            console.info('success', result);
            that.props.onChange(result);
        }).catch(function (err) {
            Notify.error('fail to change date');
        });
    },

    onEstimatedTimeKeyDown: function (e) {
        var ENTER = 13;
        if( e.keyCode == ENTER ) {
            this.updateEstimatedTime(e.target.value);
        }
    },

    updateEstimatedTime: function (time) {
        var time = this.inspectTime(time);
        var that = this;
        if (time === undefined) {
            time = 'null';
        }
        DataAPI.Task.update({
            id: this.props.task._id,
            estimatedTime: time
        }).then(function(result) {
            console.info('success', result.estimatedTime);
            that.setState({
                estimatedTime: result.estimatedTime
            });
            that.props.onChange(result);
        }).catch(function (err) {
            Notify.error('fail to updateEstimatedTime');
        });
    },


    inspectTime: function (time) {
        if (!time) {
            return;
        }
        var unit = getDateUnit(time);
        var result;
        if (unit) {
            var value = parseFloat(time);
            if (unit === 'minute') {
                result = value;
            } else if(unit === 'hour') {
                result = value * 60;
            }  else if(unit === 'month') {
                result = value * 30 * 24 * 60;
            } else if (unit === 'year') {
                result = value * 356 * 24 * 60;
            } else if (unit === 'day') {
                result = value * 24 * 60;
            }
            return result;
        }
    },

    componentWillReceiveProps: function (nextProps) {
        var that = this;
        var task = nextProps.task;
        if (!_.isEqual(nextProps, this.props)) {
            this.setState({
                loaded: false,
                estimatedTime: task ? task.estimatedTime : null
            }, function () {
                that.load(_.extend(_.pick(nextProps, ['versionId', 'projectId']), {taskId: task._id}));
            });
        }
    },

    componentDidMount: function () {
        this.load();
    },

    componentDidUpdate: function () {
        if (this.state.loaded) {
            this.props.onLogsLoaded()
        }
    },


    load: function (params) {
        var that = this;
        var task = this.props.task;
        var params = _.extend({
            sort: 'date: -1',
            taskId: task._id
        }, _.pick(this.props, ['versionId', 'projectId']), params);
        params.populate = false;
        var promise = DataAPI.Log.load(params)
            .then(function (logs) {
                that.setState({
                    loaded: true,
                    logs: logs
                });
            });
        return promise;
    },

    hide: function () {
        this.props.onHidden();
    },

    correctLastActiveTime: function () {
        var task = this.state.task;
        DataAPI.Log.load({
            tasks: task.name,
            populate: false,
            sort: "start:-1",
            limit:1
        }).then(function (log) {
            if (_.isEmpty(log)) {return;}
            log = log[0];
            return DataAPI.Task.update({
                id: task._id,
                lastActiveTime: log.end
            }).then(function(result) {
                that.setState({
                    task: result
                });
                that.props.onChange(result);
            }, function () {
                Notify.error('fail to correct last activetime of' + task.name);
            });
        })
    }
});

function buildTime(time) {
    if (!time) {
        return;
    }
    var month, day, hour;
    var hour = time / 60;
    if (hour < 1) {
        return number(time) + ' minutes';
    } else if (hour < 24) {
        return number(hour) + ' hours';
    } else if (hour >= 24) {
        day = hour / 24;
        if (day > 1 && day < 30) {
            return number(day) + ' days';
        } else if (day >= 30){
            month = day / 30;
            if (month > 1 && month < 12) {
                return number(month) + ' months';
            } else if (month >= 12) {
                year = month / 12;
                return number(year) + ' years';
            }
        }
    }
}

function isInt(n){
    return Number(n)===n && n%1===0;
}

function number(val) {
    if(!isInt(val)) {
        return val.toFixed(1);
    }
    return val;
}

function getDateUnit(time) {
    if (!time) {
        return;
    }
    var dateWords = ['year', 'month', 'day', 'week', 'hour', 'minute'];
    var arr = time.split(/\s+/);
    var unitStr = arr[1];
    var unit;
    if (!unitStr) {
        return 'minute';
    }
    if (unitStr === 'm') {
        return 'minute';
    } else if (unitStr === 'M') {
        return 'month';
    } else if (unitStr.toLowerCase() === 'min') {
        return 'minute';
    } else if (unitStr.toLowerCase() === 'mon') {
        return 'month';
    }
    dateWords.some(function (word) {
        var firstLetter = word[0];
        if (word === unitStr ||
            firstLetter === unitStr ||
            firstLetter.toUpperCase() === unitStr ||
            (word + 's') === unitStr ||
            word === unitStr.toLowerCase()
        ) {
            unit = word;
        }
    })
    return unit;
}

var EMPTY_FUN = function () {};
var DateTimePicker = React.createClass({

    getDefaultProps: function () {
        return {
            onChange: EMPTY_FUN
        };
    },

    render: function () {
        return (
            <div className='ltt_c-DateTimePicker input-group date'>
                <input type='text' name={this.props.name} className="form-control" />
                <span className="input-group-addon"><span className="glyphicon glyphicon-calendar"></span></span>
            </div>
        )
    },


    componentDidMount: function () {
        var that = this;
        var $el = $(this.getDOMNode());
        $el.datetimepicker()
        if (this.props.value) {
            $el.data('DateTimePicker').date(new Moment(this.props.value).toDate());
        } else {
            $el.data('DateTimePicker').date(null);
        }
        $el.on('dp.change', function (e) {
            var date = e.date;
            if (date && date.isSame(e.oldDate)) {console.log('same');return;}
            that.props.onChange({
                name: that.props.name,
                date: date ? date.toDate() : 'null'
            });
        });
    },

    componentWillReceiveProps: function (nextProps) {
        console.log('receive');
        var dateTimePicker = $(this.getDOMNode()).data('DateTimePicker');
        if (!dateTimePicker) { return; }
        if (nextProps.value) {
            dateTimePicker.date(new Moment(nextProps.value).toDate());
        } else {
            dateTimePicker.date(null);
        }
    }
});