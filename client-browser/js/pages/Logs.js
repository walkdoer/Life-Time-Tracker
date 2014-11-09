/**
 * @jsx React.DOM
 */

var React = require('react');
var $ = require('jquery');
require('../libs/bootstrap-datepicker');
var remoteStorage = require('../components/storage.remote');
var Moment = require('moment');
var Log = require('../components/Log');
var Logs = React.createClass({

    getInitialState: function () {
        return {
            logs: []
        };
    },

    componentDidMount: function () {
        var that = this;
        var today = new Moment().format('YYYY-MM-DD');
        $(this.refs.date.getDOMNode()).datepicker({
            format: 'yyyy-mm-dd'
        }).on('changeDate', function (e) {
            var date = e.date;
            that.searchLogs(date);
        }).datepicker('setDate', today);
    },
    render: function () {
        var logs = this.state.logs.map(function (log, index) {
            return Log(log);
        });
        return (
            <div className="ltt_c-page-logs">
                <input type="text" ref="date" className="ltt_c-page-logs-date"/>
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
