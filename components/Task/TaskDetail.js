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

/**components*/
var Log = require('../Log');
var remoteStorage = require('../storage.remote');
var LoadingMask = require('../LoadingMask');
var Notify = require('../Notify');

/** Utils */
var DataAPI = require('../../utils/DataAPI');

module.exports = React.createClass({

    getInitialState: function () {
        return {
            loaded: false,
            logs: []
        };
    },

    getDefaultProps: function () {
        return {
            onHidden: function () {}
        };
    },

    render: function () {
        var task = this.props.task;

        return (
            <aside className="ltt_c-projectTask-logs">
                <div className="ltt_c-LogList">
                    <div className="ltt_c-LogList-header">
                        <input type="text" placeHolder="filter log" className="searchInput"/>
                        <span className="closeWindow" onClick={this.hide} title="close">
                            <i className="fa fa-close"></i>
                        </span>
                    </div>
                    <div className="ltt_c-taskDetail-dateInfo">
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
                            <Col xs={6} className="ltt_c-taskDetail-dateInfo-item-label" md={4}>Estimated Time</Col>
                            <Col xs={12} className="ltt_c-taskDetail-dateInfo-item-input" md={8}>
                                <input type="text" name="estimatedTime" ref="estimatedTime" onChange={this.updateTime} value={task.estimatedTime}/>
                            </Col>
                        </Row>
                        <Row className="ltt_c-taskDetail-dateInfo-item">
                            <Col xs={6} className="ltt_c-taskDetail-dateInfo-item-label" md={4}>Due Time</Col>
                            <Col xs={12} className="ltt_c-taskDetail-dateInfo-item-input" md={8}>
                                <DateTimePicker name="dueTime" ref="dueTime" onChange={this.updateTime} value={task.dueTime}/>
                            </Col>
                        </Row>
                    </div>
                    {this.renderLogs()}
                    <LoadingMask loaded={this.state.loaded}/>
                </div>
            </aside>
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
        changedValue[name] = date;
        DataAPI.Task.update(changedValue).then(function(result) {
            console.info('success', result);
        }).catch(function (err) {
            console.log(err);
            Notify.error('fail to change date');
        });
    },

    componentWillReceiveProps: function (nextProps) {
        var that = this;
        if (!_.isEqual(nextProps, this.props)) {
            this.setState({
                loaded: false
            }, function () {
                that.load();
            });
        }
    },

    componentDidMount: function () {
        this.load();
    },


    load: function (date) {
        var that = this;
        var params = _.extend({
            sort: 'date: -1'
        }, _.pick(this.props, ['versionId', 'taskId', 'projectId']));
        params.populate = false;
        var promise = remoteStorage.get('/api/logs', params)
            .then(function (res) {
                that.setState({
                    loaded: true,
                    logs: res.data
                });
            });
        return promise;
    },

    hide: function () {
        this.props.onHidden();
    }
});

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
        $el.datetimepicker().on('dp.hide', function (e) {
            var date = e.date;
            var date2 = $el.datetimepicker('date');
            console.log(date, date2);
            that.props.onChange({
                name: that.props.name,
                date: date.toDate()
            });
        });
        $el.data('DateTimePicker').date(new Moment(this.props.value).toDate());
    }
});