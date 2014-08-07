/**
 * stat helper
 * define the common function that use by the statists here.
 */
'use strict';

var moment = require('moment');
var msg = require('../message');
var extend = require('node.extend');

exports.getLogs = function(data) {
    var logArr = data.split('\n').filter(isEmpty);
    return logArr;
};
function getClasses(data) {
    var result = data.match(/\{.*?\}/g);
    var classes = [];
    if (!result) { return null; }
    result.forEach(function(classStr) {
        var classArr;
        classStr = classStr.trim().replace(/[\{\}]/g, '');
        if (classStr) {
            classArr = classStr.split(',');
        }
        classes = classes.concat(classArr);
    });
    //unique the classes array
    return classes.filter(onlyUnique);
}

function getTags(data) {
    var result = data.match(/\[.*?\](?!\()/ig);
    var tags = [];
    if (!result) { return null; }
    result.forEach(function(tagStr) {
        var tagArr;
        tagStr = tagStr.trim().replace(/[\[\]]/ig, '');
        if (tagStr) {
            tagArr = tagStr.split(',');
        }
        tags = tags.concat(tagArr);
    });
    //unique the tags array
    return tags.filter(onlyUnique);
}

function getTimeSpan(log, date) {
    var timeSpan = null,
        plusOneDay = false;
    var timeSpanRex = /\d{1,2}\s*:\s*\d{1,2}\s*([~-]\s*\d{1,2}\s*:\s*\d{1,2})*/ig;
    var result = log.match(timeSpanRex);
    if (result && result.length) {
        timeSpan = {};
        var timeStr = result[0];
        var timeArr = timeStr.split(/[~-]/).map(function (val) {
            return val.trim();
        });
        var startHour, endHour, start, end;
        start = timeArr[0];
        if (start) {
            timeSpan.start = start;
            startHour = parseInt(start.split(':')[0]);
        }
        end = timeArr[1];
        if (end) {
            timeSpan.end = end;
            endHour = parseInt(end.split(':')[0]);
        }
        //endHour should greater than startHour, except 23: 47 ~ 00:00
        if (endHour !== undefined && startHour !== undefined && endHour < startHour) {
            if (endHour !== 0) {
                msg.warn('make sure the date is right of this log: ' + log);
            } else {
                plusOneDay = true;
            }
        }
        if (end && start) {
            var dateFomate = 'YYYY-MM-DD HH:mm';
            var startTime = new moment(date + ' ' + start, dateFomate),
                endTime = new moment(date + ' ' + end, dateFomate);
            if (plusOneDay) {
                endTime.add(1, 'd');
            }
            timeSpan.len = endTime.diff(startTime, 'minutes');
        }
    }
    return timeSpan;
}

function getLogInfo (log, date, index) {
    var logInfo = {
        classes: getClasses(log),
        tags: getTags(log),
        index: index
    };
    var timeSpan = getTimeSpan(log, date);
    return extend(logInfo, timeSpan);
}

function isEmpty(val) {
    return !!val;
}

function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
}
exports.getClasses = getClasses;
exports.getTags = getTags;
exports.getTimeSpan = getTimeSpan;
exports.getLogInfo = getLogInfo;
