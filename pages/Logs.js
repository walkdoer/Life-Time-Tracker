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
var RB = require('react-bootstrap');
var Button = RB.Button;
var Well = RB.Well;

/* components */
var Log = require('../components/Log');
var DatePicker = require('../components/DatePicker');
var LoadingMask = require('../components/LoadingMask');

/* utils */
var DataAPI = require('../utils/DataAPI');
/*    <DatePicker
onChange={this.onDateChange}
className="ltt_c-page-logs-date"/>*/

var Logs = React.createClass({

    getInitialState: function () {
        this._filterParams = {};
        return {
            logs: null,
            tags: [],
            tagOperatorAnd: false,
            logLoaded: true
        };
    },

    render: function () {
        return (
            <div className="ltt_c-page ltt_c-page-logs">
                {this.renderFilters()}
                <div className="ltt_c-page-logs-list">
                    {this.renderLogs()}
                    <LoadingMask loaded={this.state.logLoaded}/>
                </div>
            </div>
        );
    },

    renderLogs: function () {
        var logs = this.state.logs;
        if (logs && logs.length > 0) {
            return logs.map(function (log, index) {
                return Log(log);
            });
        } else if (!logs){
            return <Well className="align-center MT-20">通过条件查找日志</Well>
        } else {
            return <Well className="align-center MT-20">找不到日志!</Well>
        }
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
                <Button bsSize='small' active={this.state.tagOperatorAnd} onClick={this.onTagOperatorChange}>And</Button>
            </div>
        );
    },

    onTagOperatorChange: function () {
        this.setState({
            tagOperatorAnd: !this.state.tagOperatorAnd
        }, function () {
            this.loadLogs();
        });
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
                $select.on('change', _.debounce(function (e) {
                     that.onTagFilterChange(e.val);
                }, 200));
            });
        });
    },

    onTagFilterChange: function(tags) {
        if (!_.isEmpty(tags)) {
            this.setFilter({
                tags: tags.join(',')
            });
            this.loadLogs();
        } else {
            this.deleteFilter('tags');
            this.loadLogs();
        }
    },

    loadLogs: function () {
        var that = this;
        var filter = this.getFilter();
        this.setState({ logLoaded: false });
        if (_.isEmpty(filter)) {
            this.setState({
                logs: null
            });
        } else {
            this.queryLogs(that.getRequestParams()).then(function (logs) {
                that.setState({
                    logs: logs,
                    logLoaded: true
                });
            });
        }
    },

    getRequestParams: function () {
        return _.extend({
            tagOperator: this.state.tagOperatorAnd ? 'all' : 'or'
        }, this.getFilter());
    },

    queryLogs: function (params) {
        return DataAPI.Log.load(params);
    },

    setFilter: function (filter) {
        extend(this._filterParams, filter);
    },

    getFilter: function () {
        return this._filterParams;
    },

    deleteFilter: function (filterName) {
        delete this._filterParams[filterName];
    }
});





module.exports = Logs;
