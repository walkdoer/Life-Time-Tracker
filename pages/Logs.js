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
var EasyPieChart = require('easyPieChart');

/* components */
var Log = require('../components/Log');
var DatePicker = require('../components/DatePicker');
var LoadingMask = require('../components/LoadingMask');
var Notify = require('../components/Notify');
var Tag = require('../components/Tag');

/* utils */
var DataAPI = require('../utils/DataAPI');
var Util = require('../utils/Util');
var DATE_TIME_FORMAT = Util.DATE_TIME_FORMAT;
var DATE_FORMAT = Util.DATE_FORMAT;


/**configs*/
var config = require('../conf/config');
var SortTypes = {
  ASC: 'ASC',
  DESC: 'DESC',
};


/*    <DatePicker
onChange={this.onDateChange}
className="ltt_c-page-logs-date"/>*/

var Logs = React.createClass({

    getInitialState: function () {
        this._filterParams = {};
        return {
            logs: null,
            tags: [],
            totalTime: null,
            tagOperatorAnd: false,
            logLoaded: true
        };
    },

    render: function () {
        var emptyLogs = _.isEmpty(this.state.logs);
        var totalTime = this.state.totalTime;
        var sumTime;
        if (!emptyLogs) {
            sumTime = this.state.logs.reduce(function (sum, log) { return sum + log.len;}, 0);
        }
        return (
            <div className="ltt_c-page ltt_c-page-logs">
                {this.renderFilters()}
                <div className="Grid Grid-gutters">
                    { !emptyLogs ?
                    <div className="Grid-cell u-1of3">
                        {Util.displayTime(sumTime)}
                        {totalTime > 0 ? <Pie value={sumTime} total={totalTime}/> : null }
                    </div> : null
                    }
                    { !emptyLogs ? <div className="Grid-cell u-2of3"></div> : null }
                </div>
                <div className="ltt_c-page-logs-list" ref="list">
                    {this.renderLogs()}
                    <LoadingMask loaded={this.state.logLoaded}/>
                </div>
            </div>
        );
    },

    renderLogs: function () {
        var logs = this.state.logs;
        if (logs && logs.length > 0) {
            var $tableContaner = $(this.refs.list.getDOMNode());
            var width = $tableContaner.width();
            var height = $tableContaner.height();
            return <LogsTable logs={logs} height={height} width={width}/>
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
        this.loadTotalTime();
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
    },

    loadTotalTime: function () {
        var that = this;
        DataAPI.Log.totalTime()
            .then(function (total) {
                that.setState({
                    totalTime: total
                });
            });
    }
});


var LogsTable = React.createClass({

    getInitialState: function () {
        return {
            sortDir: null,
            sortBy: null,
            logs: this.props.logs
        };
    },


    componentWillReceiveProps: function (nextProps) {
        this.setState({
            logs: nextProps.logs,
            sortBy: null,
            sortDir: null
        });
    },

    render: function () {
        var logs = this.state.logs;
        var clsssesConfig = config.classes;

        function rowGetter(index) {
            return logs[index];
            //return [log.date, log.start, log.end, log.len, log.tags.join(","), log.content];
        }
        function renderDate(cellData) {
            return Moment(cellData).format(DATE_FORMAT);
        }
        function renderDateTime(cellData) {
            return Moment(cellData).format(DATE_TIME_FORMAT);
        }
        function renderTimeLength(cellData) {
            return Util.displayTime(cellData);
        }
        function renderProject(project) {
            return project && project.name;
        }
        function renderVersion (version) {
            return version && version.name;
        }
        function renderTask(task) {
            return task && task.name;
        }
        function renderTags(a,b,data) {
            var tags = data.tags;
            return tags && tags.map(function (tag) {
                return <Tag>{tag}</Tag>;
            });
        }
        function renderClasses(a,b,data) {
            var classes = data.classes;
            if (!classes) {return;}
            var cls = classes[0];
            if (!cls) {return;}
            var clsConfig = clsssesConfig.filter(function (cfg) { return cfg._id === cls; })[0];
            if (!clsConfig) {return cls;}
            return <span style={{color: clsConfig.color}}>{clsConfig.name}</span>
        }

        var sortDir = this.state.sortDir;
        var sortBy = this.state.sortBy;

        function getLabel(label, cellDataKey) {
            var sortDirArrow;
            if (sortDir !== null){
                sortDirArrow = (sortDir === SortTypes.DESC ? ' ↓' : ' ↑');
            }
            label = label + (sortBy === cellDataKey ? sortDirArrow : '');
            return label;
        }
        return <Table
            rowHeight={50}
            rowGetter={rowGetter}
            rowsCount={logs.length}
            width={this.props.width}
            height={this.props.height}
            headerHeight={50}>
            <Column label={getLabel("Date", "date")}  width={100} dataKey="date" fixed={true} cellRenderer={renderDate}  headerRenderer={this._renderHeader}/>
            <Column label=""  width={80} dateKey="classes" cellRenderer={renderClasses} headerRenderer={this._renderHeader.bind(this, getLabel("Class", "classes"), "classes")}/>
            <Column label={getLabel("Start", "start")}  width={150} dataKey="start" cellRenderer={renderDateTime} headerRenderer={this._renderHeader}/>
            <Column label={getLabel("End" , "end" )} width={150}  dataKey="end" cellRenderer={renderDateTime} headerRenderer={this._renderHeader}/>
            <Column label={getLabel("Length", "length")}  width={100} dataKey="len" cellRenderer={renderTimeLength} headerRenderer={this._renderHeader}/>
            <Column label={getLabel("Project", "project")}  width={150}  dataKey="project" cellRenderer={renderProject} headerRenderer={this._renderHeader}/>
            <Column label={getLabel("Version", "version")}  width={150}  dataKey="version" cellRenderer={renderVersion} headerRenderer={this._renderHeader}/>
            <Column label={getLabel("Task", "task")}  width={150}  dataKey="task" cellRenderer={renderTask} headerRenderer={this._renderHeader}/>
            <Column label="Content" width={300} dataKey="content" />
        </Table>
    },

    _sortRowsBy: function (cellDataKey) {
        var sortDir = this.state.sortDir;
        var sortBy = cellDataKey;
        if (sortBy === this.state.sortBy) {
            sortDir = this.state.sortDir === SortTypes.ASC ? SortTypes.DESC : SortTypes.ASC;
        } else {
            sortDir = SortTypes.DESC;
        }
        var logs = this.state.logs.slice();
        logs.sort(function (a, b) {
            var sortVal = 0;
            if ( a[sortBy] > b[sortBy]) {
                sortVal = 1;
            }
            if ( a[sortBy] < b[sortBy]) {
                sortVal = -1;
            }

            if (sortDir === SortTypes.DESC) {
                sortVal = sortVal * -1;
            }
            return sortVal;
        })
        this.setState({
            logs: logs,
            sortBy: sortBy,
            sortDir: sortDir
        });
    },

    _renderHeader: function (label, cellDataKey) {
        return (
            <span className="sorter" onClick={this._sortRowsBy.bind(null, cellDataKey)}>{label}</span>
        );
    }
})


var Pie = React.createClass({

    render: function () {
        var percent = this.props.value / this.props.total * 100;
        return <div className="ltt_c-EasyPieChart" data-percent={percent}>{percent.toFixed(2) + '%'}</div>
    },

    componentDidMount: function () {
        this._plot();
    },

    componentDidUpdate: function () {
        this._plot();
    },

    _plot: function (props) {
        return new EasyPieChart(this.getDOMNode(), {size: 150});
    }
});




module.exports = Logs;
