var React = require('react');
var d3 = require('d3');
var Moment = require('moment');
var Q = require('q');
var CalHeatMap = require('../../libs/cal-heatmap');
var _ = require('lodash');
var LoadingMask = require('../LoadingMask');
var server = require('../../conf/config').server;
var DataAPI = require('../../utils/DataAPI');
var Util = require('../../utils/Util');


var CalendarHeatMap = React.createClass({
    displayName: 'calendarHeatMap',

    getInitialState: function () {
        return {
            loaded: true,
            data: this.props.data || []
        };
    },

    componentDidMount: function () {
        this._renderChart();
    },

    _renderChart: function () {
        var that = this
        if (_.isFunction(this.props.getData)) {
            this.props.getData()
                .then(function (data) {
                    that.setState({loaded: true, data: data});
                });
        } else {
            this.renderCalendar(this.state.data);
        }
    },

    componentWillReceiveProps: function (nextProps) {
        if (nextProps.data !== undefined) {
            this.setState({
                data: nextProps.data
            });
        }
    },

    componentDidUpdate: function () {
        this.redraw();
    },

    renderCalendar: function (data) {
        this.calendar = createCalHealMap.call(this, this.state.data, this.getDrawOptions());
        this.redrawHandler = _.debounce(this.redraw, 300);
        $(window).on('resize', this.redrawHandler);
    },

    componentWillUnmount: function () {
        $(window).off('resize', this.redrawHandler);
    },

    render: function() {
        return (
            <div className="ltt_c-calendarHeapMap" style={this.props.style}>
                {this.getStreakInfo(this.state.data)}
                {this.props.noButton === true ? null : <div className="btn-group">
                    <button className="btn btn-xs" onClick={this.prev}><i className="fa fa-angle-left" title="previous"></i></button>
                    <button className="btn btn-xs" onClick={this.next}><i className="fa fa-angle-right" title="next"></i></button>
                </div>}
                <div className="calendar"></div>
                <LoadingMask loaded={this.state.loaded}/>
            </div>
        );
    },

    redraw: function () {
        $(this.getDOMNode()).find('.calendar').empty();
        this.calendar = createCalHealMap.call(this, this.state.data, this.getDrawOptions());
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
        data = data || [];
        data.sort(function (a, b) {
            return (new Date(a.date).getTime() - new Date(b.date).getTime());
        });
        if (this.props.noStreak === true) {return null; }

        var today = new Moment().format(Util.DATE_FORMAT);
        var streak = 0;
        var streaks = [], prevDate;
        var lastIndex = data.length - 1;
        data.forEach(function (item, index) {
            var date = item.date;
            var mDate = new Moment(date);
            var count = item.count;
            if (prevDate && mDate.diff(prevDate, 'day') === 1) {
                streak++;
                if (index === lastIndex) {
                    streaks.push(streak);
                }
            } else {
                if (streak > 0) {
                    streaks.push(streak);
                }
                streak = 1;
            }
            prevDate = mDate;
        });
        var currentStreak = getCurrentStreak(data);
        //get the longest streak
        var longestStreak = Math.max.apply(Math, streaks) || 0;
        if (currentStreak === 0) {
            lastActiveDate  = getLastActiveDate(data);
        }
        return (
            <div className="ltt_c-calendarHeapMap-streak">
                <span className="streakItem">Current Streak: {currentStreak}</span>
                {currentStreak === 0 && lastActiveDate ? <span className="streakItem">last activite is {new Moment(lastActiveDate).from(today)}</span> : null}
                <span className="streakItem">Longest Streak: {longestStreak}</span>
            </div>
        );
    },

    update: function () {
        this._renderChart();
    }
});

function getLastActiveDate(data) {
    var len = data.length;
    if (len === 0) {return null;}
    return data[len - 1].date;
}

function getCurrentStreak(data) {
    var len = data.length;
    var prevDate, mDate, streak = 0;
    if (len === 0) {return streak;}
    var latestActivity = data[len -1];
    var today = new Moment().format(Util.DATE_FORMAT);
    if (latestActivity.date !== today) { return streak; }
    prevDate = new Moment(latestActivity.date);
    streak = 1;
    //backward search array get current streaks
    for (var i = len - 2, item; i>=0;i--) {
        item = data[i];
        mDate = new Moment(item.date);
        if (prevDate.diff(mDate, 'day') === 1) {
            streak++;
        } else {
            break;
        }
        prevDate = mDate;
    }
    return streak;
}

 function createCalHealMap(data, options) {
    var calendar = new CalHeatMap();
    var that = this;
    var now = new Moment();
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
    var range = this.props.range || Math.round(((width + cellPadding) / (cellSize + cellPadding)) / colOfMonth) - 1;
    var startDate = this.props.start || now.subtract(range / 2, 'month').startOf('month').toDate();
    var defaulOptions = {
        itemSelector: $el[0],
        data: renderData,
        start: startDate,
        displayLegend: this.props.displayLegend === undefined ? true : this.props.displayLegend,
        domain: this.props.domain || "month",
        subDomain: this.props.subDomain || "day",
        range: range,
        //subDomainTextFormat: "%d",
        cellSize: cellSize,
        cellPadding: cellPadding,
        tooltip: true,
        subDomainTitleFormat: {
            empty: 'No data'
        },
        legendColor: this.props.legendColor,
        subDomainDateFormat: function(date) {
            return Moment(date).format('D号 dddd');
        }
    };
    calendar.init(_.extend({}, defaulOptions, options));
    return calendar;
}

module.exports = CalendarHeatMap;
