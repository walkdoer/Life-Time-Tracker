/**
 * @jsx React.DOM
 */

var React = require('react');
var $ = require('jquery');
require('../libs/bootstrap-datepicker');
var remoteStorage = require('../components/storage.remote');
var Moment = require('moment');
var Select2 = require('select2');
var extend = require('extend');
var _ = require('lodash');

/* components */
var Log = require('../components/Log');
var DatePicker = require('../components/DatePicker');

/* utils */
var DataAPI = require('../utils/DataAPI');
/*    <DatePicker
onChange={this.onDateChange}
className="ltt_c-page-logs-date"/>*/

var Logs = React.createClass({

    getInitialState: function () {
        this._filterParams = {};
        return {
            logs: [],
            tags: []
        };
    },

    render: function () {
        var logs = this.state.logs.map(function (log, index) {
            return Log(log);
        });
        return (
            <div className="ltt_c-page ltt_c-page-logs">
                {this.renderFilters()}
                <div className="ltt_c-page-logs-list">
                    {logs}
                </div>
            </div>
        );
    },


    /*onDateChange: function (date) {
        var that = this;
        this.setFilter({
            start: new Moment(date).startOf('day').toDate(),
            end: new Moment(date).endOf('day').toDate(),
        });
        this.loadLogs();
    },*/


    renderFilters: function () {
        return (
            <div className="ltt_c-page-logs-filters">
                Tags: <select className="filter-tags" ref="tagFilter" multiple="multiple">
                    {this.state.tags.map(function (tag) {
                        return <option value={tag.name}>{tag.name}</option>
                    })}
                </select>
            </div>
        );
    },

    componentDidMount: function () {
        var that = this;
        DataAPI.Tag.load().then(function (tags) {
            console.log('tags length:' + tags.length);
            that.setState({
                tags: tags
            }, function () {
                console.log(that.refs.tagFilter);
                var $select = $(that.refs.tagFilter.getDOMNode());
                $select.select2();
                $select.on('change', function (e) {
                    var tags = e.val;
                    if (!_.isEmpty(tags)) {
                        that.setFilter({tags: tags.join(',')});
                        that.loadLogs();
                    }
                });
            });
        });
    },

    loadLogs: function () {
        var that = this;
        this.queryLogs(that.getFilter()).then(function (logs) {
            that.setState({
                logs: logs
            });
        });
    },

    queryLogs: function (params) {
        return DataAPI.Log.load(params);
    },

    setFilter: function (filter) {
        extend(this._filterParams, filter);
    },

    getFilter: function () {
        return this._filterParams;
    }
});





module.exports = Logs;
