/**
 * @jsx React.DOM
 */

var React = require('react');
var $ = require('jquery');
require('../libs/bootstrap-datepicker');
var remoteStorage = require('../components/storage.remote');
var Moment = require('moment');
var Log = require('../components/Log');
var DatePicker = require('../components/DatePicker');
var Logs = React.createClass({

    getInitialState: function () {
        return {
            logs: []
        };
    },

    render: function () {
        var logs = this.state.logs.map(function (log, index) {
            return Log(log);
        });
        return (
            <div className="ltt_c-page-logs">
                <DatePicker
                    onChange={this.searchLogs}
                    className="ltt_c-page-logs-date"/>
                <div className="ltt_c-page-logs-list">
                    {logs}
                </div>
            </div>
        );
    },
    searchLogs: function (date) {
        var that = this;
        remoteStorage.get('/api/logs/' + new Moment(date).format('YYYY/MM/DD'))
            .then(function (result) {
                that.setState({
                    logs: result.data
                });
            }).catch(function (err) {
                console.error(err.stack);
            });
    }
});

module.exports = Logs;
