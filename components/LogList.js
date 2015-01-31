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

    render: function () {
        var logs = this.state.logs.map(function (log, index) {
            return Log(log);
        });
        return (
            <div className="ltt_c-LogList">
                {logs}
                <LoadingMask loaded={this.state.loaded}/>
            </div>
        );
    },

    componentWillReceiveProps: function (nextProps) {
        var that = this;
        this.setState({
            loaded: false
        }, function () {
            that.load();
        });
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
    }
});