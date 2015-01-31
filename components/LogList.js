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

    componentDidMount: function () {
        this.load();
    },

    load: function (date) {
        var that = this;
        var params = _.extend({}, this.props.params);
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