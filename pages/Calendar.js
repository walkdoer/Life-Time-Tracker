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
                var content = getEventContent(event);
                if (content) {
                    element.qtip({
                        content: content,
                        hide: {
                            delay: 400,
                            fixed: true
                        }
                    });
                }
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
                        var data = _.extend({
                            title: getEventTitle(log),
                            start: new Moment(log.start),
                            end: new Moment(log.end)
                        }, _.pick(log, ['project', 'version', 'task', 'content']));
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


function getEventContent(event) {
    if (!event.content && !event.project && !event.version && !event.task) {
        return null;
    }
    var content = [
        '<div class="eventContent">',
            '<p class="item project"><a href="#/projects/<%=project._id%>"><%=project.name%></a></p>',
            '<p class="item version"><a href="#/projects/<%=version.projectId%>/versions/<%=version._id%>"<%=version.name%></a></p>',
            '<p class="item task"><a href="<%=taskUrl%>"><%=task.name%></a></p>',
            '<div class="content"><%=content%></div>',
        '</div>'
    ].join('');
    var task = event.task;
    if (task) {
        var taskUrl;
        if (task.versionId) {
            taskUrl = '#/projects/' + task.projectId + '/versions/' + task.versionId + '/tasks/' + task._id;
        } else {
            taskUrl = '#/projects/' + task.projectId + '/tasks/' + task._id;
        }
    }

    return _.template(content, {
        content: event.content,
        project: event.project || {},
        version: event.version || {},
        task: task || {},
        taskUrl: taskUrl
    });
}