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
    } else if (type === 'annual' || type === 'year') {
        params.start = new Moment().startOf('year').toDate();
        params.end = new Moment().endOf('year').toDate();
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


exports.walkTree = walkTree;
exports.toDate = toDate;
exports.genId = genId;

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


exports.isDoingLog = function isDoingLog(log) {
    var time;
    if (log.start) {
        time = TrackerHelper.getTimeSpan(log.origin, {date: log.date, patchEnd: false});
    } else {
        return false;
    }
    return time.start && !time.end;
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


exports.getTaskUrl = exports.getUrlFromTask= function (task) {
    var url = '';
    if (!task) {return url;}
    var version = task.versionId;
    var project = task.projectId;
    if (version && project) {
        url += adaptUrl('/projects', project);
        url += adaptUrl('/versions', version);
    } else if (project && !version){
        url += adaptUrl('/projects', project);
    } else if (!project && version) {
        //do nothing
    }
    url += adaptUrl('/tasks', task);

    function adaptUrl(prefix, item) {
        var url;
        if (_.isString(item)) {
            url = prefix + '/' + item;
        } else {
            url = prefix + '/' + item._id;
        }
        return url;
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
function displayTime(timeAmount, type) {
    if (timeAmount === undefined || timeAmount === null) {
        return null;
    }
    return Moment.duration(timeAmount, type || "minutes").format("M[m],d[d],h[h],mm[min]");
}

exports.displayTime = displayTime;
exports.DATE_FORMAT = 'YYYY-MM-DD';
exports.TIME_FORMAT = 'HH:mm:ss';
exports.DATE_TIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';

var layout = 'bottomRight';
var animation = {
    open: 'animated flipInX',
    close: 'animated flipOutX'
};

exports.notify = function (cfg) {
    if (Ltt.sdk &&  Ltt.sdk.notify) {
        Ltt.sdk.notify({
            title: cfg.title,
            subtitle: cfg.subtitle,
            icon: path.join(__dirname, './images/me.jpg'),
            sound: true,
            wait: false,
            message: cfg.message
        }, {
            click: function () {
                console.log("test");
            }
        });
    } else {
        var options = {
            type: "success",
            text: _.template([
                "<div><%=title%></div>",
                "<div><%=subtitle%></div>",
                "<div><%=message%></div>"
            ].join(""))(cfg),
            dismissQueue: true,
            theme : 'relax',
            layout: layout,
            animation: animation
        };
        window.noty(options);
    }
};


exports.isElementInViewport = function isElementInViewport (el) {

    //special bonus for those using jQuery
    if (typeof jQuery === "function" && el instanceof jQuery) {
        el = el[0];
    }

    var rect = el.getBoundingClientRect();

    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) && /*or $(window).height() */
        rect.right <= (window.innerWidth || document.documentElement.clientWidth) /*or $(window).width() */
    );
};


exports.fillDataGap = function (data, start, end, transformFun) {
    var dataLen = Moment(end).diff(start, 'day') + 1;
    var result = [];
    transformFun = transformFun || function (a) {return a;};
    data.sort(function (a,b) {
        return (new Date(a._id).getTime() - new Date(b._id).getTime());
    }).forEach(function (d) {
        var diffStart = Moment(d._id).diff(start, 'day');
        var index = result.length;
        while(index < diffStart) {
            result.push(transformFun({
                date: new Moment(start).add(index, 'day').format('YYYY-MM-DD'),
                count: 0,
                empty: true
            }));
            index++;
        }
        result.push(transformFun({
            date: d._id,
            count: d.totalTime
        }));
    });
    var index = result.length;
    while(index < dataLen) {
        result.push(transformFun({
            date: new Moment(start).add(index, 'day').format('YYYY-MM-DD'),
            count: 0,
            empty: true
        }));
        index++;
    }
    return result;
};


exports.getLogDesc = function (log) {
    var desc = [];
    if (log.subTask) {
        desc.push(log.subTask.name);
    }
    if (log.task) {
        desc.push(log.task.name);
    }
    if (log.version) {
        desc.push(log.version.name);
    }
    if (!_.isEmpty(log.projects)) {
        desc.push(log.projects[0].name);
    }
    return !_.isEmpty(desc) ? desc.join(',') : '';
};