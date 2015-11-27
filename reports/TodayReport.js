/**
 * @jsx React.DOM
 */

var React = require('react');
var Moment = require('moment');
var _ = require('lodash');
var PureRenderMixin = require('react/addons').addons.PureRenderMixin;
var ReactBootStrap = require('react-bootstrap');
var numeral = require('numeral');
var Pie = require('../components/charts/Pie');
var Highcharts = window.Highcharts;
var Q = require('q');

var config = require('../conf/config');
/** components */
var LoadingMask = require('../components/LoadingMask');
var PieDetail = require('../components/PieDetail');
var TimeConsumeRanking = require('../components/TimeConsumeRanking');
var DatePicker = require('../components/DatePicker');

/** Utils */
var DataAPI = require('../utils/DataAPI');
var Util = require('../utils/Util');




module.exports = React.createClass({

    getDefaultProps: function () {
        return {
            showDatePicker : true
        };
    },

    getInitialState: function () {
        var date = this.props.date || this.props.query.date;
        return {
            date: new Moment(date)
        };
    },

    render: function () {
        var date = this.state.date;
        var today = new Moment(date).format(Util.DATE_FORMAT);
        var yesterday = new Moment(date).subtract(1, 'day').format(Util.DATE_FORMAT);
        return (
            <div className="ltt_c-report ltt_c-report-TodayReport">
                {
                this.props.showDatePicker ?
                <div className="Grid Grid--gutters">
                    <div className="Grid-cell u-1of4">
                        <DatePicker date={date} onChange={this.onDateChange}/>
                    </div>
                </div>
                :
                null
                }
                <div className="Grid Grid--gutters Grid--stretch ltt_c-report-TodayReport-header">
                    <div className="Grid-cell">
                        <PieDetail className="chart" date={date} type="classes"/>
                    </div>
                </div>
                <div className="Grid Grid--gutters Grid--stretch">
                    <div className="Grid-cell u-1of2">
                        <TimeConsumeRanking className="chart"
                            params={{
                                start: Moment(date).startOf('day').toDate(),
                                end: Moment(date).endOf('day').toDate()
                            }}/>
                    </div>
                    <div className="Grid-cell u-1of2">
                        <ClassStackChart title="Today and Yesterday Class Time Compare" date1={today} date2={yesterday} style={{height: 300}}/>
                    </div>
                </div>
            </div>
        );
    },


    onDateChange: function (date) {
        this.setState({
            date: date
        });
    }
});



var ClassStackChart = React.createClass({

    render: function () {
        return (
            <div className="ltt_c-chart-ClassStackChart" style={this.props.style}></div>
        );
    },


    componentDidMount: function () {
        var that = this;
        this.getData()
            .then(function (series) {
                that.plot(series);
            });
    },

    plot: function (series) {
        var categories = this.getCategories();
        $(this.getDOMNode()).highcharts({
            chart: {
                type: 'bar'
            },
            title: {
                text: this.props.title || ''
            },
            xAxis: [{
                categories: categories,
                reversed: false,
            }, { // mirror axis on right side
                opposite: true,
                reversed: false,
                categories: categories,
                linkedTo: 0
            }],
            yAxis: {
                title: {
                    text: null
                },
                tickInterval: 60,
                labels: {
                    formatter: function () {
                        return Math.abs(this.value) + 'minute';
                    }
                }
            },

            plotOptions: {
                series: {
                    stacking: 'normal'
                }
            },

            tooltip: {
                formatter: function () {
                    return '<b>' + this.series.name + ', age ' + this.point.category + '</b><br/>' +
                        'Time : ' + Highcharts.numberFormat(Math.abs(this.point.y), 0);
                }
            },

            series: series
        });
    },

    getCategories: function () {
        return config.classes.map(function (cls) {
            return cls.name;
        });
    },

    getData: function () {
        return Q.allSettled([
            DataAPI.Log.load({date: this.props.date1, sum: true, group: "classes"}),
            DataAPI.Log.load({date: this.props.date2, sum: true, group: "classes"})
        ]).spread(function (date1, date2) {
            var date1Value = date1.value;
            var date2Value = date2.value;
            var date1Data = [];
            var date2Data = [];
            function getData(items, clsId) {
                var val = 0;
                items.some(function (t) {
                    if (t._id === clsId) {
                        val = t.totalTime;
                        return true;
                    }
                    return false;
                });
                return val;
            }
            config.classes.map(function (cls) {
                var clsId = cls._id;
                date1Data.push(-getData(date1Value, clsId));
                date2Data.push(getData(date2Value, clsId));
            });
            return [{
                name: 'Today',
                data: date1Data
            }, {
                name: "Yesterday",
                data: date2Data
            }];
        });
    }
});