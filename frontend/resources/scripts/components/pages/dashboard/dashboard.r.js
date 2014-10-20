define(function(require) {
    'use strict';
    var React = require('react');
    var R = React.DOM;
    var CalendarHeatMap = require('../../CalendarHeatMap');
    var SleepPeriod = require('../../sleepPeriod');;

    var LogPage = React.createClass({
        displayName: 'dashboard',

        render: function() {
            var layout = [
                R.div({className: 'row classesCompared'}),
                CalendarHeatMap({
                    url: '/api/calendars/sport/2014"',
                    options: {
                        empty: 'no sport data',
                        filled: '{date} 运动时间 {count}分钟'
                    }
                }),
                SleepPeriod({
                    title: '睡眠曲线',
                    url: '/api/sleepPeriods/2014'
                }),
                R.div({className: 'row', id: 'projects'}),
                R.div({className: 'row', id: 'tags'})
            ];
            return R.div({className: 'ltt_c-dashboard'}, layout);
        },



    });

    return LogPage;
});
