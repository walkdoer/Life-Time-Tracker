/**
 * @jsx React.DOM
 */

var React = require('react');
var $ = require('jquery');
require('../libs/bootstrap-datepicker');
var Moment = require('moment');
var _ = require('lodash');

/**components*/
var Log = require('../components/Log');
var remoteStorage = require('../components/storage.remote');
var LoadingMask = require('../components/LoadingMask');
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
        var logs = this.state.logs.map(function (log, index) {
            return Log(log);
        });
        var style;
        if (this.state.isHidden) {
            style= {
                display: 'none'
            };
        }
        return (
            <aside className="ltt_c-projectTask-logs" style={style}>
                <div className="ltt_c-LogList">
                    <div className="ltt_c-LogList-header">
                        <input type="text" placeHolder="filter log" className="searchInput"/>
                        <span className="closeWindow" onClick={this.hide} title="close">
                            <i className="fa fa-close"></i>
                        </span>
                    </div>
                    {logs}
                    <LoadingMask loaded={this.state.loaded}/>
                </div>
            </aside>
        );
    },

    componentWillReceiveProps: function (nextProps) {
        var that = this;
        if (!_.isEqual(nextProps, this.props)) {
            this.setState({
                loaded: false,
                isHidden: false,
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
        var params = _.extend({}, _.pick(this.props, ['versionId', 'taskId', 'projectId']));
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
        this.setState({
            isHidden: true
        }, function () {
            this.props.onHidden();
        });
    }
});