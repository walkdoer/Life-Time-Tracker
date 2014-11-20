/**
 * @jsx React.DOM
 */

var React = require('react');
var CalendarHeatMap = require('../components/charts/CalendarHeatMap');
var SleepPeriod = require('../components/charts/SleepPeriod')
var Dashboard = React.createClass({

    render: function () {
        return (
            <div className="ltt_c-page-dashboard">
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
                    <SleepPeriod title="Sleep Period" url="/api/sleepPeriods/2014"/>
                </div>
            </div>
        );
    }

});

module.exports = Dashboard;
