/**
 * @jsx React.DOM
 */

var React = require('react');
var CalendarHeatMap = require('../components/charts/calendarHeatMap');
var Dashboard = React.createClass({

    render: function () {
        return (
            <div className="ltt_c-page-dashboard">
                <p>Dashboard</p>
                <CalendarHeatMap
                    url="/api/calendars/sport/2014"
                    options= {{
                        empty: "no sport data",
                        filled: "{date} 运动时间 {count}分钟"
                    }}/>
            </div>
        );
    }

});

module.exports = Dashboard;
