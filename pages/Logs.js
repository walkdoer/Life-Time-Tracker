/**
 * @jsx React.DOM
 */


var React = require('react');
var $ = require('jquery');
require('../libs/bootstrap-datepicker');
var Moment = require('moment');
var Select2 = require('select2');
var extend = require('extend');
var _ = require('lodash');
var RB = require('react-bootstrap');
var Button = RB.Button;
var Well = RB.Well;
var FixedDataTable = require('fixed-data-table');
var Table = FixedDataTable.Table;
var Column = FixedDataTable.Column;

/* components */
var Log = require('../components/Log');
var DatePicker = require('../components/DatePicker');
var LoadingMask = require('../components/LoadingMask');
var Notify = require('../components/Notify');

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
            <div className="ltt_c-page ltt_c-page-logs ">
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

        function rowGetter(index) {
            return logs[index];
            //return [log.date, log.start, log.end, log.len, log.tags.join(","), log.content];
        }
        if (logs && logs.length > 0) {
            return <Table
                rowHeight={50}
                rowGetter={rowGetter}
                rowsCount={logs.length}
                width={1000}
                height={800}
                headerHeight={50}>
                <Column label="Date" width={100} dataKey="date"/>
                <Column label="Start" width={100} dataKey="start" />
                <Column label="End" width={100}  dataKey="end" />
                <Column label="Length" width={100} dataKey="len" />
                <Column label="Content" width={500} dataKey="content" />
            </Table>
        } else if (!logs){
            return <Well className="align-center MT-20">通过条件查找日志</Well>
        } else {
            return <Well className="align-center MT-20">找不到日志!</Well>
        }
    },

    renderTimeline: function () {
        this.refs.timeline.getDOMNode().innerHTML = '';
        createStoryJS({
            type:       'timeline',
            width:      '800',
            height:     '600',
            source:     this.toTimelineData(this.state.logs),
            embed_id:   "ltt_c-page-logs-timeline"
        });
    },

    toTimelineData: function (logs) {
        var timeLineObj = {
            timeline: {
                "headline": "Timeline",
                "type":"default",
                "text":"<p>" + this._selectTags.join(', ') + "</p>",
                "asset": {
                    "media":"http://yourdomain_or_socialmedialink_goes_here.jpg",
                    "credit":"Show your activity timeline",
                    "caption":""
                },
                /*"era": [ //era 表示一个时间段
                    {
                        "startDate":"2015,6,10",
                        "endDate":"2015,12,11",
                        "headline":"这是什么？",
                        "text":"不知道呀",
                        "tag":"This is Optional"
                    }
                ]*/
            }
        };

        timeLineObj.timeline.date = logs.map(function (log) {
            return {
                "startDate": log.start,
                "endDate": log.end,
                "headline": log.tags.join(","),
                "text": log.content,
                "tag": log.tags.join(","),
                "asset": {
                    "credit":"what the hell",
                    "caption":"do him do him"
                }
            };
        });
        return timeLineObj;
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
            this._selectTags = tags;
            this.setFilter({
                tags: tags.join(',')
            });
            this.loadLogs();
        } else {
            this.deleteFilter('tags');
            //this.loadLogs();
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
            }).catch(function (err) {
                console.error(err.stack);
                Notify.error('load failed');
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
