define(function(require) {
    'use strict';
    var React = require('react');
    var R = React.DOM;
    var CalendarHeatMap = require('../../charts/CalendarHeatMap');
    var SleepPeriod = require('../../charts/sleepPeriod');;

    var MonthReport = React.createClass({
        displayName: 'monthReport',

        render: function() {
            var layout = [
                R.div({className: 'row'})
            ];
            return R.div({className: 'ltt_c-report'}, layout);
        },



    });

    return MonthReport;
});