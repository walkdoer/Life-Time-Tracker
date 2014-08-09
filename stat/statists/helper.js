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

function getSimpleClasses(data) {
    var result = data.match(/\{.*?\}/g);
    var classes = [];
    if (!result) {
        return null;
    }
    result.forEach(function(classStr) {
        var classArr;
        classStr = classStr.trim().replace(/[\{\}]/g, '');
        if (classStr) {
            classArr = classStr.split(',').map(function(val) {
                return val.trim();
            });
        }
        classes = classes.concat(classArr);
    });
    //unique the classes array
    return classes.filter(onlyUnique);
}

function getClasses(data) {
    var result = data.match(/\{.*?\}/g);
    var classes = [];
    if (!result) {
        return null;
    }
    result.forEach(function(classStr) {
        var classArr;
        classStr = classStr.trim().replace(/[\{\}]/g, '');
        if (classStr) {
            classArr = classStr.split(',').map(function(val) {
                return val.trim();
            });
        }
        classes = classes.concat(classArr);
    });
    return classes.reduce(function(pv, cv) {
        var target = pv.filter(function(val) {
            return val.name === cv;
        });
        if (target && target.length > 0) {
            target[0].frequence++;
        } else {
            pv.push({
                name: cv,
                frequence: 1
            });
        }
        return pv;
    }, []);
}

function getTags(data) {
    var result = data.match(/\[.*?\](?!\()/ig);
    var tags = [];
    if (!result) {
        return null;
    }
    result.forEach(function(tagStr) {
        var tagArr;
        tagStr = tagStr.trim().replace(/[\[\]]/ig, '');
        if (tagStr) {
            tagArr = tagStr.split(',').map(function(val) {
                return val.trim();
            });
        }
        tags = tags.concat(tagArr);
    });
    return tags.reduce(function(pv, cv) {
        var target = pv.filter(function(val) {
            return val.name === cv;
        });
        if (target && target.length > 0) {
            target[0].frequence++;
        } else {
            pv.push({
                name: cv,
                frequence: 1
            });
        }
        return pv;
    }, []);
}

function getSimpleTags(data) {
    var result = data.match(/\[.*?\](?!\()/ig);
    var tags = [];
    if (!result) {
        return null;
    }
    result.forEach(function(tagStr) {
        var tagArr;
        tagStr = tagStr.trim().replace(/[\[\]]/ig, '');
        if (tagStr) {
            tagArr = tagStr.split(',').map(function(val) {
                return val.trim();
            });
        }
        tags = tags.concat(tagArr);
    });
    //unique the tags array
    return tags.filter(onlyUnique);
}

function getTimeSpanFromLog(log, date) {
    var timeSpan = null,
        plusOneDay = false;
    var timeSpanRex = /\d{1,2}\s*:\s*\d{1,2}\s*([~-]\s*\d{1,2}\s*:\s*\d{1,2})*/ig;
    var result = log.match(timeSpanRex);
    if (result && result.length) {
        timeSpan = {};
        var timeStr = result[0];
        var timeArr = timeStr.split(/[~-]/).map(function(val) {
            return val.trim();
        });
        var startHour, endHour, start, end;
        start = timeArr[0];
        if (start) {
            timeSpan.start = start;
            startHour = parseInt(start.split(':')[0], 10);
        }
        end = timeArr[1];
        if (end) {
            timeSpan.end = end;
            endHour = parseInt(end.split(':')[0], 10);
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

/**
 * get the detail log info
 * @param log
 * @param date
 * @param index
 */
function getLogInfo(log, date, index) {
    var logInfo = {
        classes: getSimpleClasses(log),
        tags: getSimpleTags(log),
        index: index
    };
    var timeSpan = getTimeSpanFromLog(log, date);
    return extend(logInfo, timeSpan);
}


function getTimeSpan(start, end) {
    var startHour, endHour, plusOneDay = false, diff = -1;
    if (end && start) {
        startHour = parseInt(getHourFromDateStr(start), 10);
        endHour = parseInt(getHourFromDateStr(end), 10);
        //endHour should greater than startHour, except 23: 47 ~ 00:00
        if (endHour !== undefined && startHour !== undefined && endHour < startHour) {
            if (endHour === 0) {
                plusOneDay = true;
            }
        }
        var dateFomate = 'YYYY-MM-DD HH:mm';
        var startTime = new moment(start, dateFomate),
            endTime = new moment(end, dateFomate);
        if (plusOneDay) {
            endTime.add(1, 'd');
        }
        diff = endTime.diff(startTime, 'minutes');
    }

    return diff;
}

function getHourFromDateStr(dateStr) {
    var timeRegxp = /\d{1,2}\s*:\s*\d{1,2}/ig;
    var timeStr = dateStr.match(timeRegxp)[0];
    var timeArr = timeStr.split(':').map(trim);
    return timeArr[0];
}

function isEmpty(val) {
    return !!val;
}

function trim (val) {
    return val.trim();
}

function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
}

exports.getClasses = getClasses;
exports.getSimpleClasses = getSimpleClasses;
exports.getTags = getTags;
exports.getSimpleTags = getSimpleTags;
exports.getTimeSpan = getTimeSpanFromLog;
exports.getLogInfo = getLogInfo;
exports.timeSpan = getTimeSpan;
