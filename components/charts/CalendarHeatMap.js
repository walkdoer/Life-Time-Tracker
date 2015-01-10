var React = require('react');
var d3 = require('d3');
var moment = require('moment');
var Q = require('q');
var className = 'ltt_c-calendarHeapMap';
var CalHeatMap = require('../../libs/cal-heatmap');
var _ = require('lodash');
var LoadIndicator = require('../LoadIndicator');
var server = require('../../conf/config').server;

var CalendarHeatMap = React.createClass({
    displayName: 'calendarHeatMap',
    getInitialState: function () {
        return {
            msg: 'loading'
        };
    },
    componentDidMount: function () {
        var that = this;
        createCalHealMap.call(this, this.props.url, this.props.options)
            .then(function () {
                that.refs.ind.done();
            });
    },
    render: function() {
        return (
            <div className={className}>
                <LoadIndicator  ref='ind'/>
            </div>
        );
    }
});

 function createCalHealMap(url, options) {
    var deferred = Q.defer();
    var calendar = new CalHeatMap();
    var that = this;
    d3.json(server + url, function(error, data) {
        if (!that.isMounted()) {
            return;
        }
        deferred.resolve(data);
        var renderData = {};
        if (!data) {return;}
        data.forEach(function(val) {
            var seconds = new Date(val.date).getTime() / 1000;
            if (val.sportTime > 0) {
                renderData[seconds] = val.sportTime;
            }
        });

        var defaulOptions = {
            itemSelector: '.' + className,
            data: renderData,
            start: new Date(2014, 0),
            domain: "month",
            subDomain: "day",
            //subDomainTextFormat: "%d",
            cellSize: 12,
            cellPadding: 1,
            tooltip: true,
            subDomainTitleFormat: {
                empty: 'No data'
            },
            subDomainDateFormat: function(date) {
                return moment(date).format('D号 dddd');
            }
        };
        calendar.init(_.extend({}, defaulOptions, options));
    });
    return deferred.promise;
}

module.exports = CalendarHeatMap;
