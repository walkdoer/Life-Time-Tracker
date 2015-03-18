/**
 * @jsx React.DOM
 */

var React = require('react');
var Moment = require('moment');
var PureRenderMixin = require('react/addons').addons.PureRenderMixin;

/** Components */
var CalendarHeatMap = require('../components/charts/CalendarHeatMap');
var SleepPeriod = require('../components/charts/SleepPeriod');
var MonthCountDown = require('../components/charts/MonthCountDown');

/** Utils */
var DataAPI = require('../utils/DataAPI');

var Dashboard = React.createClass({

    mixins: [PureRenderMixin],

    render: function () {
        return (
            <div className="ltt_c-page ltt_c-page-dashboard">
                <div className="ltt_c-page-com">
                    <p className="ltt_c-page-title">Sport Cal-Heatmap</p>
                    <CalendarHeatMap
                        data={this.loadSportCalendar}
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
                    <p className="ltt_c-page-title">Meditation</p>
                    <CalendarHeatMap
                        data={this.loadMeditationCalendar}
                        empty="do not meditate this day"
                        filled="{date} meditate {count}"/>
                </div>
                <div className="ltt_c-page-com">
                    <p className="ltt_c-page-title">Thinking</p>
                    <CalendarHeatMap
                        data={this.loadThinkingCalendar}
                        empty="do not meditate this day"
                        filled="{date} meditate {count}"/>
                </div>
                <div className="ltt_c-page-com">
                    <MonthCountDown width={350} height={250} padding={0}
                        itemPadding={2} lifeYear={70} birthday='1989-10-23'/>
                </div>
            </div>
        );
    },


    loadSportCalendar: function () {
        return DataAPI.calendar({
            start: new Moment().startOf('month').subtract(1, 'year').toDate(),
            end: new Moment().endOf('month').toDate(),
            classes: 'SPR'
        });
    },


    loadMeditationCalendar: function () {
        return DataAPI.calendar({
            start: new Moment().startOf('month').subtract(1, 'year').toDate(),
            end: new Moment().endOf('month').toDate(),
            tags: 'meditation'
        });
    },

    loadThinkingCalendar: function () {
        return DataAPI.calendar({
            start: new Moment().startOf('month').subtract(1, 'year').toDate(),
            end: new Moment().endOf('month').toDate(),
            classes: 'TK'
        });
    }

});

module.exports = Dashboard;
