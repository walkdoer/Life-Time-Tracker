/**
 * @jsx React.DOM
 */

var React = require('react');
var Moment = require('moment');

var CalendarHeatMap = require('../components/charts/CalendarHeatMap');
var SleepPeriod = require('../components/charts/SleepPeriod');
var Dashboard = React.createClass({

    render: function () {
        return (
            <div className="ltt_c-page ltt_c-page-dashboard">
                <div className="ltt_c-page-com">
                    <p className="ltt_c-page-title">Sport Cal-Heatmap</p>
                    <CalendarHeatMap
                        url="/api/calendars/sport/2014"
                        options= {{
                            empty: "no sport data",
                            filled: "{date} 运动时间 {count}分钟"
                        }}/>
                </div>
                <div className="ltt_c-page-com">
                    <p className="ltt_c-page-title">Sleep Period</p>
                    <SleepPeriod title="Last 30 Day's Sleep Period"
                        url="/api/sleepPeriods"
                        start={new Moment().subtract(30, 'days').toDate()}
                        end={new Moment().toDate()}/>
                </div>
            </div>
        );
    }

});

module.exports = Dashboard;
