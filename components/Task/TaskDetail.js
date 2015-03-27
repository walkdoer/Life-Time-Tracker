/**
 * @jsx React.DOM
 */

var React = require('react');
var $ = require('jquery');
require('../../libs/bootstrap-datepicker');
var Moment = require('moment');
var _ = require('lodash');

var RB = require('react-bootstrap');
var Row = RB.Row;
var Col = RB.Col;

/**components*/
var Log = require('../Log');
var remoteStorage = require('../storage.remote');
var LoadingMask = require('../LoadingMask');
require("datetimepicker");

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
                          <Col xs={12} className="ltt_c-taskDetail-dateInfo-item-input" md={8}><DateTimePicker name="deferUntil" ref="deferUntil"/></Col>
                        </Row>
                        <Row className="ltt_c-taskDetail-dateInfo-item">
                          <Col xs={6} className="ltt_c-taskDetail-dateInfo-item-label" md={4}>Complete</Col>
                          <Col xs={12} className="ltt_c-taskDetail-dateInfo-item-input" md={8}><DateTimePicker name="completeTime" ref="completeTime"/></Col>
                        </Row>
                        <Row className="ltt_c-taskDetail-dateInfo-item">
                          <Col xs={6} className="ltt_c-taskDetail-dateInfo-item-label" md={4}>Estimated Time</Col>
                          <Col xs={12} className="ltt_c-taskDetail-dateInfo-item-input" md={8}><DateTimePicker name="estimatedTime" ref="estimatedTime"/></Col>
                        </Row>
                        <Row className="ltt_c-taskDetail-dateInfo-item">
                          <Col xs={6} className="ltt_c-taskDetail-dateInfo-item-label" md={4}>Due Time</Col>
                          <Col xs={12} className="ltt_c-taskDetail-dateInfo-item-input" md={8}><DateTimePicker name="dueTime" ref="dueTime"/></Col>
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

    componentWillReceiveProps: function (nextProps) {
        var that = this;
        if (!_.isEqual(nextProps, this.props)) {
            console.log(nextProps);
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

var DateTimePicker = React.createClass({

    render: function () {
        return (
            <div className='ltt_c-DateTimePicker input-group date'>
                <input type='text' name={this.props.name} className="form-control" />
                <span className="input-group-addon"><span className="glyphicon glyphicon-calendar"></span></span>
            </div>
        )
    },


    componentDidMount: function () {
        $(this.getDOMNode()).datetimepicker()
    }
});