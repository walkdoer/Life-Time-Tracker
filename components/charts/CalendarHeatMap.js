var React = require('react');
var d3 = require('d3');
var moment = require('moment');
var Q = require('q');
var CalHeatMap = require('../../libs/cal-heatmap');
var _ = require('lodash');
var LoadingMask = require('../LoadingMask');
var server = require('../../conf/config').server;
var DataAPI = require('../../utils/DataAPI');


var CalendarHeatMap = React.createClass({
    displayName: 'calendarHeatMap',

    getInitialState: function () {
        return {
            loaded: false,
            data: []
        };
    },
    componentDidMount: function () {
        var that = this;
        if (_.isFunction(this.props.data)) {
            this.props.data()
                .then(function (data) {
                    that.setState({loaded: true, data: data}, function () {
                        this.renderCalendar(data);
                    });
                });
        }
    },

    renderCalendar: function (data) {
        this.data = data;
        this.calendar = createCalHealMap.call(this, data, this.getDrawOptions());
        this.redrawHandler = _.debounce(this.redraw, 300);
        $(window).on('resize', this.redrawHandler);
    },

    componentWillUnmount: function () {
        $(window).off('resize', this.redrawHandler);
    },

    render: function() {
        return (
            <div className="ltt_c-calendarHeapMap">
                {this.getStreakInfo(this.state.data)}
                <div className="btn-group">
                    <button className="btn btn-xs" onClick={this.prev}><i className="fa fa-angle-left" title="previous"></i></button>
                    <button className="btn btn-xs" onClick={this.next}><i className="fa fa-angle-right" title="next"></i></button>
                </div>
                <div className="calendar"></div>
                <LoadingMask loaded={this.state.loaded}/>
            </div>
        );
    },

    redraw: function () {
        var data = this.data
        $(this.getDOMNode()).find('.calendar').empty();
        this.calendar = createCalHealMap.call(this, data, this.getDrawOptions());
    },

    getDrawOptions: function () {
        var options = _.omit(this.props, 'data');
        options.highlight = [new Date()];
        return options;
    },

    next: function () {
        this.calendar.next();
    },

    prev: function () {
        this.calendar.previous();
    },

    getStreakInfo: function (data) {
        var currentStreak = 0, longestStreak = 0, currentStreakSpan, longestStreakSpan;
        var streaks = [], prevDate;
        data.forEach(function (item, index) {
            var mDate = new moment(item.date);
            var count = item.count;
            if (prevDate && mDate.diff(prevDate, 'day') === 1) {
                currentStreak++;
            } else {
                if (currentStreak > 0) {
                    streaks.push(currentStreak);
                }
                currentStreak = 1;
            }
            prevDate = mDate;
        });
        //get the longest streak
        longestStreak = Math.max.apply(Math, streaks) || 0;

        if (currentStreak >= 0) {
            currentStreakSpan = <span className="streakItem">Current Streak: {currentStreak}</span>
        }
        if (longestStreak >= 0) {
            longestStreakSpan = <span className="streakItem">Longest Streak: {longestStreak}</span>
        }
        return (
            <div className="ltt_c-calendarHeapMap-streak">
                {currentStreakSpan}
                {longestStreakSpan}
            </div>
        );
    }
});

 function createCalHealMap(data, options) {
    var calendar = new CalHeatMap();
    var that = this;
    var now = new moment();
    if (!that.isMounted()) {
        return;
    }
    var renderData = {};
    if (!data) {return;}
    data.forEach(function(val) {
        var seconds = new Date(val.date).getTime() / 1000;
        if ((val.count) > 0) {
            renderData[seconds] = val.count;
        }
    });
    var $el = $(that.getDOMNode()).find('.calendar');
    var cellSize = 12,
        colOfMonth = 5,
        cellPadding = 1;
    var width = $el.width();
    var range = Math.round(((width + cellPadding) / (cellSize + cellPadding)) / colOfMonth) - 1;
    var startDate = now.subtract(range / 2, 'month').startOf('month').toDate();
    var defaulOptions = {
        itemSelector: $el[0],
        data: renderData,
        start: startDate,
        domain: "month",
        subDomain: "day",
        range: range,
        //subDomainTextFormat: "%d",
        cellSize: cellSize,
        cellPadding: cellPadding,
        tooltip: true,
        subDomainTitleFormat: {
            empty: 'No data'
        },
        subDomainDateFormat: function(date) {
            return moment(date).format('D号 dddd');
        }
    };
    calendar.init(_.extend({}, defaulOptions, options));
    return calendar;
}

module.exports = CalendarHeatMap;
