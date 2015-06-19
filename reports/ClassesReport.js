/**
 * @jsx React.DOM
 */

var React = require('react');
var _ = require('lodash');
var Moment = require('moment');

/** components */
var DateRangePicker = require('../components/DateRangePicker');
var FullDateRangePicker = require('../components/FullDateRangePicker');
var PercentArea = require('../components/charts/PercentChart');
var LoadingMask = require('../components/LoadingMask');
var ActivityBar = require('../components/charts/ActivityBar');

/** constant */
var DATE_FORMAT = 'YYYY-MM-DD';

/** configs */
var config = require('../conf/config');

/** Utils */
var DataAPI = require('../utils/DataAPI');

module.exports = React.createClass({

    getInitialState: function () {
        return {
            startDate: new Moment().startOf('day').subtract(1, 'month').toDate(),
            endDate: new Moment().startOf('day').toDate(),
            granularity: 'day'
        };
    },

    render: function () {
        var logClasses = config.classes;
        return (
            <div className="ltt_c-report ltt_c-report-classes">
                <div>
                    <FullDateRangePicker
                        ref="dateRange"
                        showCompare={false}
                        start={this.state.startDate} end={this.state.endDate}
                        onDateRangeChange={this.onDateRangeChange}
                    />
                </div>
                {this.state.classesTrend ? <PercentArea height={200} data={this.state.classesTrend}/> : null }
                <ActivityBar
                    params={{group: 'classes'}}
                    detailParams={function (selectItem) {
                        return {
                            classes: selectItem
                        };
                    }}
                    getName={function (item) {
                        var classId = item._id;
                        var cls = _.find(logClasses, function (cls) { return cls._id === classId});
                        return (cls && cls.name) || "unknow";
                    }}
                    mapCategory={function (category) {
                        var cls = _.find(logClasses, function (cls) { return cls.name === category});
                        return (cls && cls._id) || categrory;
                    }}
                    startDate={this.state.startDate}
                    endDate={this.state.endDate}/>
                <LoadingMask loaded={this.state.loaded}/>
            </div>
        );
    },

    componentDidMount: function () {
        this.loadClassesTrend();
    },

    onDateRangeChange: function (start, end) {
        this.setState({
            startDate: start,
            endDate: end,
            loaded: false
        }, function () {
            this.loadClassesTrend();
        });

    },

    loadClassesTrend: function () {
        var that = this;
        DataAPI.get('/classesTrend', {
            start: new Moment(this.state.startDate).format(DATE_FORMAT),
            end: new Moment(this.state.endDate).format(DATE_FORMAT),
            granularity: this.state.granularity
        })
        .then(function (data) {
            data = that.adaptClassesTrendData(data);
            that.setState({
                loaded: true,
                classesTrend: data
            });
        })
        .catch(function (err) {
            console.error(err.stack);
        });
    },

    adaptClassesTrendData: function (classesData) {
        var classData;
        var granularity = this.state.granularity;
        var startDate = this.state.startDate;
        var endDate = this.state.endDate;
        var logClasses = config.classes;
        return _.map(classesData, function (classData) {
            var data = classData.data;
            var mStart = new Moment(startDate);
            var mEnd = new Moment(endDate);
            var seriesData = [], item;
            while (mEnd.diff(mStart, granularity) >= 0) {
                var year = mStart.year(),
                    month = mStart.month() + 1,
                    day = mStart.date();
                item = data.filter(function (item) {
                    var date = item.date;
                    return date.year === year && date.month === month && date.day === day;
                })[0];
                if (item) {
                    seriesData.push([getDate(item.date), item.len]);
                } else {
                    seriesData.push([getDate(mStart), 0]);
                }
                mStart.add(1, granularity);
            }
            var classId = classData.class;
            var cls = _.find(logClasses, function (cls) { return cls._id === classId});
            return {
                name: (cls && cls.name) || "unknow",
                data: seriesData
            };
        })

        function getDate(dateObj) {
            var date;
            if (typeof dateObj.diff === 'function') {
                date = dateObj.toDate();
            } else {
                date  = new Date(dateObj.year, dateObj.month - 1, dateObj.day);
            }
            return new Moment(date).unix() * 1000;
        }
    },

});

