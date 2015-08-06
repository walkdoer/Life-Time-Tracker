'use strict';
var Moment = require('moment');
require('moment-range');
var TrackerHelper = require('tracker/helper');
var _ = require('lodash');
var config = require('../conf/config');
var path = require('path');


function walkTree(parentElement, func) {
    parentElement.depth = 0;
    parentElement.next = null;
    var children, i, len, child;
    var depth, current;
    current = parentElement;
    while (current) {
        depth = current.depth;
        children = current.children;
        var done = func(current);
        if (done === false) {
            return;
        }
        //removes this item from the linked list
        current = current.next;
        for (i = 0, len = children ? children.length : 0; i < len; i++) {
            child = children[i];
            child.depth = depth + 1;
            //place new item at the head of the list
            child.next = current;
            current = child;
        }
    }
}

function toDate(type) {
    var params = {};
    if (type === 'yesterday') {
        params.start = new Moment().subtract(1, 'day').startOf('day').toDate();
        params.end = new Moment().subtract(1, 'day').endOf('day').toDate();
    } else if (type === 'weekly' || type === 'week') {
        params.start = new Moment().startOf('week').toDate();
        params.end = new Moment().endOf('week').toDate();
    } else if ( type === 'today' || type === 'day') {
        params.start = new Moment().startOf('day').toDate();
        params.end = new Moment().endOf('day').toDate();
    } else if ( type === 'monthly' || type === 'month') {
        params.start = new Moment().startOf('month').toDate();
        params.end = new Moment().endOf('month').toDate();
    } else if ( type === 'last_seven_day' || type === 'last_seven_days' ||type === 'last_7_days') {
        params.start = new Moment().subtract(7, 'day').startOf('day').toDate();
        params.end = new Moment().endOf('day').toDate();
    } else if ( type === 'last_three_day' || type === 'last_three_days' || type === 'last_3_days') {
        params.start = new Moment().subtract(3, 'day').startOf('day').toDate();
        params.end = new Moment().endOf('day').toDate();
    } else if ( type === 'last_fifteen_day' || type === 'last_fifteen_days' || type === 'last_15_days') {
        params.start = new Moment().subtract(15, 'day').startOf('day').toDate();
        params.end = new Moment().endOf('day').toDate();
    } else if (type === 'last_month') {
        params.start = new Moment().subtract(1, 'month').startOf('day').toDate();
        params.end = new Moment().endOf('day').toDate();
    }
    params.diff = Moment(params.end).diff(params.start, 'day') + 1;
    return params;
}


function genId(){
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 5; i++ ) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }

    return text;
}

function getUrlFromTask(task) {
    var url;
    if (!task) {return;}
    if (task.versionId) {
        url = '/projects/' + task.projectId + '/versions/' + task.versionId + '/tasks/' + task._id;
    } else {
        url = '/projects/' + task.projectId + '/tasks/' + task._id;
    }
    return url;
}




exports.walkTree = walkTree;
exports.toDate = toDate;
exports.genId = genId;
exports.getUrlFromTask = getUrlFromTask;
exports.checkLogContent = function (date, content) {
    var includeErrorInfo = true;
    var includeLogWithoutTime = false;
    var result = TrackerHelper.getLogs(content, date, includeLogWithoutTime, includeErrorInfo);
    var logSequenceError = TrackerHelper.getLogSequenceError(result.logs);
    result.errors = result.errors.concat(logSequenceError);
    return result;
};


exports.isValidLog = function (log) {
    return TrackerHelper.isValidLog(log);
};


exports.getDoingLog = function (date, logContent) {
    var logs, target;
    try {
        logs = TrackerHelper.getLogs(logContent, date);
        target = _.find(logs, function (log) {
            var timeStr = TrackerHelper.getTimeStr(log.origin);
            if (timeStr && timeStr.indexOf('~') >= 0) {
                var time = TrackerHelper.getTimeSpan(log.origin, {date: date, patchEnd: false});
                return time.start && !time.end;
            } else {
                return false;
            }
        });
    } catch (err) {
        console.error(err.stack);
        return null;
    }
    return target;
};


var isInDateRange = function (type) {
    return function (date) {
        date = new Moment(date);
        var start = new Moment().startOf(type);
        var end = new Moment().endOf(type);
        var range = Moment.range(start, end);
        return range.contains(date);
    };
};

exports.isInThisYear = isInDateRange('year');
exports.isInThisWeek = isInDateRange('week');
exports.isInThisMonth = isInDateRange('month');
exports.isInToday = isInDateRange('day');
exports.isInYesterday = function (date) {
    date = new Moment(date);
    var start = new Moment().subtract(1, 'day').startOf('day');
    var end = new Moment().subtract(1, 'day').endOf('day');
    var range = Moment.range(start, end);
    return range.contains(date);
};

exports.getProjectUrl = function (proj) {
    var url = '';
    if (!proj) {return url;}
    return '/projects/' + proj._id;
};


exports.getTaskUrl = function (task) {
    var url = '';
    if (!task) {return url;}
    if (task.versionId) {
        url = '/projects/' + task.projectId + '/versions/' + task.versionId + '/tasks/' + task._id;
    } else {
        url = '/projects/' + task.projectId + '/tasks/' + task._id;
    }
    return url;
};


exports.getVersionUrl = function (version) {
    var url = '';
    url = '/projects/' + version.projectId + '/versions/' + version._id;
    return url;
};


exports.getClassName = function (clsId) {
    var classes = config.classes;
    var cls = classes.filter(function (cls) {
        return cls._id === clsId;
    })[0];
    if (cls) {
        return cls.name;
    } else {
        return null;
    }
};
function displayTime(timeAmount) {
    if (timeAmount === undefined || timeAmount === null) {
        return null;
    }
    return Moment.duration(timeAmount, "minutes").format("M[m],d[d],h[h],mm[min]")
}

exports.displayTime = displayTime;
exports.DATE_FORMAT = 'YYYY-MM-DD';
exports.TIME_FORMAT = 'HH:mm:ss';
exports.DATE_TIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';


exports.notify = function (title, subtitle, message) {
    if (Ltt.sdk &&  Ltt.sdk.notify) {
        Ltt.sdk.notify({
            title: title,
            subtitle: subtitle,
            icon: path.join(__dirname, './images/me.jpg'),
            sound: true,
            wait: false,
            message: message
        }, {
            click: function () {
                console.log("test");
            }
        });
    }
};