/**
 * stat helper
 * define the common function that use by the statists here.
 */
'use strict';

var moment = require('moment');
var msg = require('../message');
var extend = require('node.extend');

function getLogs(data, date) {
    var logStrArr = data.split('\n').filter(isEmpty);
    var lastIndex = logStrArr.length - 1;
    var logs = [];
    logStrArr.forEach(function(logStr, index) {
        var sleepTime;
        var logInfo = getLogInfo(logStr, date, index);
        if (logInfo) {
            if (isGetUpLog(logInfo)) {
                logInfo.wake = true;
                logInfo.time = date + ' ' + logInfo.start;
            } else if (isSleepTime(logInfo, lastIndex)){
                logInfo.sleep = true;
                var hour = parseInt(getHourFromDateStr(logInfo.start), 10);
                if (hour === 0) {
                    sleepTime = nextDay(date) + ' ' + logInfo.start;
                } else {
                    sleepTime = date + ' ' + logInfo.start;
                }
                logInfo.time = sleepTime;
            }
            if (logInfo.len === undefined) {
                logInfo.len = 0;
            }
            logs.push(logInfo);
        }
    });
    function isGetUpLog(log) {
        return log.start && !log.end && log.index === 0;
    }

    function isSleepTime(log, lastIndex) {
        return log.start && !log.end && log.index === lastIndex;
    }
    return logs;
}



function getWakeTime(logData, date) {
    var wakeTime = null;
    var getUpLog = getLogs(logData, date).filter(function (log) {
        return log.wake === true;
    })[0];
    if (getUpLog) {
        wakeTime = getUpLog.time;
    }
    return wakeTime;
}

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
    var diff = -1;
    if (end && start) {
        var dateFomate = 'YYYY-MM-DD HH:mm';
        var startTime = new moment(start, dateFomate),
            endTime = new moment(end, dateFomate);
        diff = endTime.diff(startTime, 'minutes');
    } else {
        throw new Error('date arguments not fit, should have start and end');
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

function nextDay(date) {
    var dateArr = date.split('-'),
        year = parseInt(dateArr[0], 10),
        month = parseInt(dateArr[1], 10),
        day = parseInt(dateArr[2], 10),
        nextDateStr = [year, month, day + 1].join('-');
    return nextDateStr;
}

function groupTimeByTags (logs) {
    var result = [];
    logs.forEach(function (log) {
        var tags = log.tags;
        if (tags && tags.length) {
            tags.forEach(function (tag) {
                var target = result.filter(function (tagTime) {
                    return tagTime.label === tag;
                });
                if (target && target.length) {
                    target[0].count += log.len;
                } else {
                    result.push({
                        label: tag,
                        count: log.len
                    });
                }
            });
        }
    });
    return result;
}
exports.getClasses = getClasses;
exports.getSimpleClasses = getSimpleClasses;
exports.getTags = getTags;
exports.getSimpleTags = getSimpleTags;
exports.getTimeSpan = getTimeSpanFromLog;
exports.getLogInfo = getLogInfo;
exports.timeSpan = getTimeSpan;
exports.getHour = getHourFromDateStr;
exports.nextDay = nextDay;
exports.getLogs = getLogs;
exports.getWakeTime = getWakeTime;
exports.groupTimeByTags = groupTimeByTags;
