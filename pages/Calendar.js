/**
 * @jsx React.DOM
 */

var React = require('react');
var _ = require('lodash');
var Moment = require('moment');

/** Utils */
var DataAPI = require('../utils/DataAPI');

module.exports = React.createClass({

    render: function () {
        return (
            <div className="ltt_c-page ltt_c-page-calendar">
                <div className="calendar" ref="calendarContainer"></div>
            </div>
        );
    },

    componentDidMount: function () {
        var $container = $(this.refs.calendarContainer.getDOMNode());
        $container.fullCalendar({
            header: {
                left: 'prev,next today',
                center: 'title',
                right: 'month,agendaWeek,agendaDay'
            },
            editable: false,
            eventLimit: true,
            height: $container.height(),
            events: function(start, end, timezone, callback) {
                DataAPI.Log.load({
                    start: start.toDate(),
                    end: end.toDate()
                }).then(function (logs) {
                    var events = logs.map(function (log) {
                        if (log.start === log.end) {
                            return null;
                        }
                        return {
                            title: getEventTitle(log),
                            start: new Moment(log.start),
                            end: new Moment(log.end)
                        };
                    });
                    callback(events.filter(function (event) {
                        return event !== null;
                    }));
                });
            }
        });
    }

});

function getEventTitle(log) {
    var title = '';
    if (!_.isEmpty(log.classes)) {
        title += log.classes.join(',');
    }
    if (!_.isEmpty(log.tags)) {
        title += '[' + log.tags.join(',') + ']';
    }
    title += log.content;
    return title;
}