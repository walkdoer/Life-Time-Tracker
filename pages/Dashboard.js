/**
 * @jsx React.DOM
 */

var React = require('react');
var Moment = require('moment');

var CalendarHeatMap = require('../components/charts/CalendarHeatMap');
var SleepPeriod = require('../components/charts/SleepPeriod');
var MonthCountDown = require('../components/charts/MonthCountDown');
var Dashboard = React.createClass({

    render: function () {
        return (
            <div className="ltt_c-page ltt_c-page-dashboard">
                <div className="ltt_c-page-com">
                    <p className="ltt_c-page-title">Sport Cal-Heatmap</p>
                    <CalendarHeatMap
                        empty="no sport data"
                        filled="{date} 运动时间 {count}分钟"/>
                </div>
                <div className="ltt_c-page-com">
                    <p className="ltt_c-page-title">Sleep Period</p>
                    <SleepPeriod title="Last 30 Day's Sleep Period"
                        url="/api/sleepPeriods"
                        start={new Moment().subtract(30, 'days').toDate()}
                        end={new Moment().toDate()}/>
                </div>
                <div className="ltt_c-page-com">
                    <MonthCountDown width={350} height={250} padding={0}
                        itemPadding={2} lifeYear={70} birthday='1989-10-23'/>
                </div>
            </div>
        );
    }

});

module.exports = Dashboard;
