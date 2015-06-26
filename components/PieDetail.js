/**
 * @jsx React.DOM
 */

var React = require('react');
var Moment = require('moment');
var _ = require('lodash');
var PureRenderMixin = require('react/addons').addons.PureRenderMixin;
var ReactBootStrap = require('react-bootstrap');
var numeral = require('numeral');
var Pie = require('./charts/Pie');

var config = require('../conf/config');

/** components */
var LoadingMask = require('./LoadingMask');

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
                enabled: false,
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
                </div>
                <LoadingMask loaded={this.state.loaded}/>
            </div>
        );
    },

    renderCompare: function () {
        var todayData = this.state.todayData;
        var yesterdayData = this.state.yesterdayData;
        var logClasses = config.classes;
        return (
            <div className="ltt_c-LogClassPie-changes">
            {logClasses.map(function (logClass) {
                var time = 0, yesterdayTime;
                var classId = logClass._id;
                var data;
                if (!_.isEmpty(logClassTime)) {
                    data = logClassTime.filter(function(item) {
                        return item.id === classId;
                    })[0];
                    if (data) {
                        time = data.count;
                    }
                }
                if (!_.isEmpty(yesterDayLogClassTime)) {
                    data = yesterDayLogClassTime.filter(function(item) {
                        return item.id === classId;
                    })[0];
                    if (data) {
                        yesterdayTime = data.count;
                    }
                }
                var progressNumber, progressPercentage, progress;
                if (yesterdayTime > 0) {
                    progressNumber = time - yesterdayTime;
                    progressPercentage = progressNumber / yesterdayTime;
                    progress = (
                        <p className={'changeItem ' + (progressNumber > 0 ? 'rise' : (progressNumber < 0 ? 'down' : 'equal'))}>
                            <span className="name">{logClass.name}</span>
                            <span className="num">
                            <i className={"fa fa-" + (progressNumber > 0 ? 'long-arrow-up' :
                                (progressNumber < 0 ? 'long-arrow-down' : 'minus'))}></i>
                            {numeral(progressPercentage * 100).format('0.0')}%
                            </span>
                        </p>
                    );
                }
                return progress;
            })}
            </div>
        );
    },

    //{yesterDayLogClassTime ? <Pie data={yesterDayLogClassTime} highchartOptions={highchartOptions}/> : null }

    loadData: function (nextProps) {
        if (!nextProps) {
            props = this.props;
        } else {
            props = nextProps;
        }
        var type = props.type;
        var start = props.start,
            end = props.end,
            date = props.date;
        var that = this;
        if (start && end) {
            start = new Moment(start).startOf('day').format(DATE_FORMAT);
            end = new Moment(end).endOf('day').format(DATE_FORMAT);
        } else if (date) {
            start = new Moment(date).startOf('day').format(DATE_FORMAT);
            end = new Moment(date).endOf('day').format(DATE_FORMAT);
        }
        var promise = DataAPI.Log.load({
            start: new Moment(start).startOf('day').format(DATE_FORMAT),
            end: new Moment(end).endOf('day').format(DATE_FORMAT),
            group: type,
            sum: true
        }).then(function (statResult) {
            that.setState({
                loaded: true,
                todayData: statResult
            });
        });
        if (this.props.compare) {
            return promise.then(function () {
                return DataAPI.Log.load({
                    start: new Moment(start).subtract(1, 'day').startOf('day').format(DATE_FORMAT),
                    end: new Moment(end).subtract(1, 'day').endOf('day').format(DATE_FORMAT),
                    sum: true,
                    group: type
                });
            }).then(function (statResult) {
                that.setState({
                    yesterdayData: statResult
                });
            });
        } else {
            return promise;
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
})