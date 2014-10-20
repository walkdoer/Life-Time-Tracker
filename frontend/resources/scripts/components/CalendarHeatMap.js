define(function(require) {
    'use strict';
    var React = require('react');
    var d3 = require('d3');
    var moment = require('moment');
    var CalHeatMap = require('scripts/libs/cal-heatmap');
    var R = React.DOM;
    var Q = require('q');
    var className = 'ltt_c-calendarHeapMap';
    var _ = require('underscore');
    var LoadIndicator = require('./loadIndicator');

    var CalendarHeatMap = React.createClass({
        displayName: 'calendarHeatMap',
        getInitialState: function () {
            return {
                msg: 'loading'
            };
        },
        componentDidMount: function () {
            var that = this;
            createCalHealMap(this.props.url, this.props.options)
                .then(function () {
                    that.refs.ind.done();
                });
        },
        render: function() {
            return R.div({className: className}, LoadIndicator({ref: 'ind'}));
        }
    });

     function createCalHealMap(url, options) {
        var deferred = Q.defer();
        var calendar = new CalHeatMap();
        d3.json(url, function(error, data) {
            deferred.resolve(data);
            var renderData = {};
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

    return CalendarHeatMap;
});
