var React = require('react');
var d3 = require('d3');
var moment = require('moment');
var Q = require('q');
var CalHeatMap = require('../../libs/cal-heatmap');
var _ = require('lodash');
var LoadIndicator = require('../LoadIndicator');
var server = require('../../conf/config').server;
var DataAPI = require('../../utils/DataAPI');

var CalendarHeatMap = React.createClass({
    displayName: 'calendarHeatMap',

    getDefaultProps: function () {
        return {
            startDate: new moment().startOf('month').subtract(1, 'year').toDate(),
            endDate: new moment().endOf('month').toDate()
        };
    },

    getInitialState: function () {
        return {
            msg: 'loading'
        };
    },
    componentDidMount: function () {
        var that = this;
        DataAPI.calendar('sport', {
            start: this.props.startDate,
            end: this.props.endDate
        }).then(function (data) {
            that.data = data;
            that.calendar = createCalHealMap.call(that, data, that.props);
            that.redrawHandler = _.debounce(that.redraw, 300);
            $(window).on('resize', that.redrawHandler);
        });
    },

    componentWillUnmount: function () {
        $(window).off('resize', this.redrawHandler);
    },

    render: function() {
        return (
            <div className="ltt_c-calendarHeapMap">
                <div className="btn-group">
                    <button className="btn btn-xs" onClick={this.prev}><i className="fa fa-angle-left" title="previous"></i></button>
                    <button className="btn btn-xs" onClick={this.next}><i className="fa fa-angle-right" title="next"></i></button>
                </div>
                <div className="calendar"></div>
            </div>
        );
    },

    redraw: function () {
        var data = this.data
        $(this.getDOMNode()).find('.calendar').empty();
        this.calendar = createCalHealMap.call(this, data, this.props);
    },

    next: function () {
        this.calendar.next();
    },

    prev: function () {
        this.calendar.previous();
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
        if (val.sportTime > 0) {
            renderData[seconds] = val.sportTime;
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
