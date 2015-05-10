/**
 * @jsx React.DOM
 */

var React = require('react');
var _ = require('lodash');
var Moment = require('moment');

/** components */
var remoteStorage = require('../components/storage.remote');
var DateRangePicker = require('../components/DateRangePicker');
var PercentArea = require('../components/charts/PercentChart');
var LoadingMask = require('../components/LoadingMask');
var ActivityBar = require('../components/charts/ActivityBar');

/** constant */
var DATE_FORMAT = 'YYYY-MM-DD';


module.exports = React.createClass({

    getInitialState: function () {
        return {
            startDate: new Moment().startOf('day').subtract(1, 'month').toDate(),
            endDate: new Moment().startOf('day').toDate(),
            granularity: 'day'
        };
    },

    render: function () {
        return (
            <div className="ltt_c-report ltt_c-report-classes">
                <div>
                     <DateRangePicker ref="dateRange" start={this.state.startDate} end={this.state.endDate}
                            onDateRangeChange={this.onDateRangeChange}/>
                </div>
                {this.state.classesTrend ? <PercentArea height={200} data={this.state.classesTrend}/> : null }
                <ActivityBar
                    params={{group: 'classes'}}
                    detailParams={function (selectItem) {
                        return {
                            classes: selectItem
                        };
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
        remoteStorage.get('/api/classesTrend', {
                start: new Moment(this.state.startDate).format(DATE_FORMAT),
                end: new Moment(this.state.endDate).format(DATE_FORMAT),
                granularity: this.state.granularity
            })
            .then(function (result) {
                var data = result.data;
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
            return {
                name: classData.class,
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

