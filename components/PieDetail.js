/**
 * @jsx React.DOM
 */

var React = require('react');
var Moment = require('moment');
var _ = require('lodash');
var PureRenderMixin = require('react/addons').addons.PureRenderMixin;
var ReactBootStrap = require('react-bootstrap');
var Table = ReactBootStrap.Table;
var numeral = require('numeral');
var Pie = require('./charts/Pie');
var Q = require('q');

var config = require('../conf/config');

/** components */
var LoadingMask = require('./LoadingMask');
var LogLine = require('./charts/LogLine');

/** Utils */
var DataAPI = require('../utils/DataAPI');

/** constants */
var DATE_FORMAT = 'YYYY-MM-DD HH:mm:ss';


module.exports = React.createClass({

    mixins: [PureRenderMixin],

    getInitialState: function () {
        return {
            loaded: false
        };
    },

    getDefaultProps: function () {
        return {
            date: new Moment()
        };
    },

    render: function () {
        var todayData = this.state.todayData;
        var yesterdayData = this.state.yesterdayData;
        var logClasses = config.classes;
        var highchartOptions = {
            title: false,
            plotOptions: {
                pie: {
                    innerSize: '40%'
                }
            },
            legend: {
                enabled: true,
                align: 'right',
                verticalAlign: 'top',
                layout: 'vertical',
                x: 0,
                y: 100
            },
            exporting: {
                enabled: false
            }
        };
        if (this.props.backgroundColor) {
            highchartOptions.chart = {
                backgroundColor: this.props.backgroundColor
            };
        }
        todayData = todayData && todayData.map(function (item) {
            var cls = _.find(logClasses, {'_id': item._id});
            return {
                value: item.totalTime,
                label: (cls && cls.name) || item._id
            };
        });
        return (
            <div className={"ltt_c-PieDetail Grid " + (this.props.className || '')}>
                <div className="Grid-cell u-1of3 ltt_c-PieDetail-pie">
                    {todayData ? <Pie data={todayData} highchartOptions={highchartOptions}/> : null }
                </div>
                <div className="Grid-cell u-2of3 ltt_c-PieDetail-compare">
                    <Table striped condensed hover>
                        <thead>
                          <tr>
                            <th className="col-sm-2">Name</th>
                            <th className="col-sm-3">Percent</th>
                            <th className="col-sm-4">Compare</th>
                            <th className="col-sm-4">Activity</th>
                          </tr>
                        </thead>
                        <tbody>
                            {this.renderCompare()}
                        </tbody>
                      </Table>
                </div>
                <LoadingMask loaded={this.state.loaded}/>
            </div>
        );
    },

    renderCompare: function () {
        var date = this.props.date;
        var todayData = this.state.todayData;
        var yesterdayData = this.state.yesterdayData;
        var logClasses = config.classes;
        var weekData = this.state.weekData;
        return logClasses.map(function (logClass) {
                return <Detail date={date}
                    item={logClass}
                    todayData={todayData}
                    yesterdayData={yesterdayData}
                    weekData={weekData}
                    params={{
                        classes: logClass._id
                    }}/>
            }, this);

    },

    //{yesterDayLogClassTime ? <Pie data={yesterDayLogClassTime} highchartOptions={highchartOptions}/> : null }

    loadData: function (nextProps) {
        if (!nextProps) {
            props = this.props;
        } else {
            props = nextProps;
        }
        var type = props.type,
            date = props.date;
        var that = this;
        return Q.all([
            loadToday(),
            loadYesterDay(),
            loadWeek()
        ]).spread(function (today, yesterday, week) {
            that.setState({
                loaded: true,
                todayData: today,
                yesterdayData: yesterday,
                weekData: week
            });
        }).catch(function (err) {
            console.error(err.stack);
        });

        function loadYesterDay() {
            return DataAPI.Log.load({
                start: new Moment(date).subtract(1, 'day').startOf('day').format(DATE_FORMAT),
                end: new Moment(date).subtract(1, 'day').endOf('day').format(DATE_FORMAT),
                sum: true,
                group: type
            });
        }

        function loadToday() {
            return DataAPI.Log.load({
                start: new Moment(date).startOf('day').format(DATE_FORMAT),
                end: new Moment(date).endOf('day').format(DATE_FORMAT),
                group: type,
                sum: true
            })
        }

        function loadWeek() {
            return DataAPI.Log.load({
                start: new Moment(date).startOf('week').format(DATE_FORMAT),
                end: new Moment(date).endOf('week').format(DATE_FORMAT),
                sum: true,
                group: type
            });
        }
    },

    componentDidMount: function () {
        this.loadData();
    },

    componentWillReceiveProps: function (nextProps) {
        this.loadData(nextProps);
    },

    update: function () {
        this.loadData();
    }
});

Detail = React.createClass({

    getInitialState: function () {
        return {
            activitiesLoaded: false,
            activities: []
        };
    },

    render: function () {
        var item = this.props.item;
        var date = this.props.date;
        var weekData = this.props.weekData;
        var yesterdayData = this.props.yesterdayData;
        var todayData = this.props.todayData;
        var time, yesterdayTime;
        var id = item._id;
        var todayTime = getTimeConsumeBy(id, todayData);
        var yesterdayTime = getTimeConsumeBy(id, yesterdayData);
        var weekTime = getTimeConsumeBy(id, weekData), meanWeekTime;
        var todayTotal = todayData ? todayData.reduce(function (total, itm) { return total + itm.totalTime}, 0) : 0;
        var weekTotal = weekData ? weekData.reduce(function (total, itm) { return total + itm.totalTime}, 0) : 0;
        if (weekTime) {
            meanWeekTime  = weekTime / (new Moment(date).day() + 1);
        }
        var cpToYesterday, cpToMeanWeek, item;
        cpToYesterday = compare(todayTime, yesterdayTime)
        cpToMeanWeek = compare(todayTime, meanWeekTime);

        return (
            <tr>
                <td className="vert-align text-center">{item.name}</td>
                <td className="vert-align">
                    <p>今日占比: {todayTotal && todayTime ? numeral(todayTime / todayTotal * 100).format('0.0') : '0'}%</p>
                    <p>一周占比: {weekTotal && todayTime ? numeral(todayTime / weekTotal * 100).format('0.0') : '0'}%</p>
                </td>
                <td className="vert-align">
                    <div className={"change " + (cpToYesterday > 0 ? 'rise' : (cpToYesterday < 0 ? 'down' : 'equal'))}>
                        较昨日:{this._toNumItem(cpToYesterday)}
                    </div>
                    <div className={"change " + (cpToMeanWeek> 0 ? 'rise' : (cpToMeanWeek < 0 ? 'down' : 'equal'))}>
                        较本周平均: {this._toNumItem(cpToMeanWeek)}
                    </div>
                </td>
                <td className="vert-align">
                    <LogLine logs={this.state.activities}
                        granularity='week'
                        date={date}
                        highlightToday={true}
                        title={false}
                        xAxisLabel={false}
                        yAxisLabel={false}/>
                    <LoadingMask loaded={this.state.activitiesLoaded}/>
                </td>
            </tr>
        );
    },

    componentDidMount: function () {
        var date = this.props.date;
        this.loadActivity(new Moment(date).startOf('week').toDate(), new Moment(date).endOf('week').toDate());
    },

    _toNumItem: function (progressPercentage){
        if (isNaN(progressPercentage)) {return;}
        return [
            <i className={"fa fa-" + (progressPercentage > 0 ? 'long-arrow-up' :(progressPercentage < 0 ? 'long-arrow-down' : 'minus'))}></i>,
            <span className="num">{numeral(progressPercentage * 100).format('0.0')}%</span>
        ]
    },

    loadActivity: function (start, end) {
        var that = this;
        var params = _.extend({
            sort: 'date: -1',
            start: start,
            end: end,
            populate: false
        }, this.props.params);
        DataAPI.Log.load(params).then(function (data) {
            that.setState({
                activitiesLoaded: true,
                activities: data
            });
        }).fail(function (err) {
            that.setState({
                activitiesLoaded: true,
                activitiesLoadFailed: true
            })
        });
    }
})


function compare(a, b) {
    if (a === b) {
        return 0;
    }
    if (b !== undefined && b !== 0) {
        return (a - b) / b;
    } else {
        return 1;
    }
}
function getTimeConsumeBy(id, data) {
    var time = 0, target;
    if (!_.isEmpty(data)) {
        target = data.filter(function(item) {
            return item._id === id;
        })[0];
        if (target) {
            time = target.totalTime;
        }
    }
    return time;
}