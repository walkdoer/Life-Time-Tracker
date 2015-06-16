/**
 * @jsx React.DOM
 */

var React = require('react');
var _ = require('lodash');
var Moment = require('moment');
var Color = require('color');

/** Components */
var Notify = require('../components/Notify');

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
        var that = this;
        DataAPI.Class.load().then(function (classes) {
            that.initCalendar(classes);
        });
    },

    initCalendar: function (classes) {
        var $container = $(this.refs.calendarContainer.getDOMNode());
        $container.fullCalendar({
            header: {
                left: 'prev,next today',
                center: 'title',
                right: 'month,agendaWeek,agendaDay'
            },
            defaultView: 'agendaWeek',
            editable: false,
            eventLimit: true,
            eventRender: function (event, element, view) {
                element.qtip({
                    content: event.content
                });
            },
            height: $container.height(),
            events: function(start, end, timezone, callback) {
                DataAPI.Log.load({
                    start: start.toDate(),
                    end: end.toDate(),
                    populate: true
                }).then(function (logs) {
                    var events = logs.map(function (log) {
                        var logClass = log.classes[0];
                        if (log.start === log.end) {
                            return null;
                        }
                        var data = {
                            title: getEventTitle(log),
                            start: new Moment(log.start),
                            end: new Moment(log.end),
                            content: log.content
                        };
                        if (logClass) {
                            var logClassObj = classes.filter(function (cls) {
                                return cls._id === logClass;
                            })[0];
                            if (logClassObj && logClassObj.color) {
                                var backgroupColor = logClassObj.color;
                                var borderColor = Color(backgroupColor).darken(0.2);
                                data.backgroundColor = backgroupColor;
                                data.borderColor = borderColor.rgbString();
                            }
                        }
                        return data;
                    });
                    callback(events.filter(function (event) {
                        return event !== null;
                    }));
                }).catch(function (err) {
                    console.log(err.stack);
                    Notify.error('Sorry, failed to show calendar events!');
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
    // if (log.project) {
    //     title += ',<span>' + log.project.name + '</span>';
    // }
    // if (log.version) {
    //     title += ',' + log.version.name;
    // }
    // if (log.task) {
    //     title += ',' + log.task.name + ',';
    // }
    return title;
}