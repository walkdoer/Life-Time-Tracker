/**
 * stat helper
 * define the common function that use by the statists here.
 */
'use strict';

var moment = require('moment');
var LogClass = require('./model/fundament/logClass');
var logClassName = require('./conf/logClassName');
var msg = require('./message');
var extend = require('node.extend');
var dateFormat = 'YYYY-MM-DD HH:mm';
var timeSplitter = ':';

function getLogs(data, date) {
    var logStrArr = data.split('\n').filter(isEmpty);
    var lastIndex = logStrArr.length - 1;
    var logs = [];
    logStrArr.forEach(function(logStr, index) {
        var logInfo = getLogInfo({
            logStr: logStr,
            date: date,
            index: index,
            isFirst: index === 0,
            isLast: index === lastIndex
        });
        if (logInfo) {
            if (isGetUpLog(logInfo)) {
                logInfo.wake = true;
                logInfo.end = logInfo.start;
                logInfo.time = logInfo.start;
            } else if (isSleepTime(logInfo, lastIndex)){
                logInfo.sleep = true;
                logInfo.end = logInfo.start;
                //需要校准，有可能凌晨之后睡觉
                logInfo.time = logInfo.start;
            } else if (logInfo.sign.indexOf('off') >= 0) {
                logInfo.offDuty = true;
                logInfo.end = logInfo.start;
                //需要校准，是有可能存在加班到凌晨之后
                logInfo.time = logInfo.start;
            }
            if (logInfo.len < 0) {
                msg.error(date + '\'s ' + logStr + '\'s time length is less that 0');
            }
            if (logInfo.len === undefined || logInfo.len < 0) {
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


function alignTime(date, time, config) {
    var newDate;
    var hour = parseInt(getHourFromDateStr(time), 10);
    if (hour === 0 || (hour > 0 && hour < 5 && config.moment && config.isLast)) {
        newDate = nextDay(date) + ' ' + time;
    } else {
        newDate = date + ' ' + time;
    }
    return newDate;
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

function getLogClasses(data) {
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
    return classes.reduce(function(result, cv) {
        var target = result.filter(function(val) {
            return val.code === cv;
        });
        if (target && target.length > 0) {
            target[0].frequence++;
        } else {
            var name = logClassName[cv];
            var logClass = new LogClass({name: name, code: cv});
            logClass.frequence = 1;
            result.push(logClass);
        }
        return result;
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
                //tag不区分大小写
                return val.trim().toLowerCase();
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
                //tag不区分大小写
                return val.trim().toLowerCase();
            });
        }
        tags = tags.concat(tagArr);
    });
    //unique the tags array
    return tags.filter(onlyUnique);
}


function getSigns(data) {
    var result = data.match(/`.*?`/g);
    var signs = [];
    if (!result) {
        return signs;
    } else {
        result.forEach(function(signStr) {
            var signArr;
            signStr = signStr.trim().replace(/`/g, '');
            if (signStr) {
                signArr = signStr.split(',').map(function(val) {
                    return val.trim();
                });
            }
            signs = signs.concat(signArr);
        });
    }
    return signs;
}

function getTimeSpanFromLog(log, config) {
    var date = config.date;
    var timeSpan = null,
        plusOneDay = false;
    var timeSpanRex = /\d{1,2}\s*[:：]\s*\d{1,2}\s*(\s*[~～-]\s*\d{1,2}\s*[:：]\s*\d{1,2})*/ig;
    var result = log.match(timeSpanRex);
    if (result && result.length === 1) {
        timeSpan = {};
        var timeStr = result[0];
        var timeArr = timeStr.split(/[~-]/).map(function(val) {
            return val.trim();
        });
        var startTime, endTime,
            startHour, endHour, start, end;
        start = timeArr[0];
        end = timeArr[1];
        if (start) {
            var alignConfig = extend({}, config, { moment: !end });
            var algTime = alignTime(date, start, alignConfig);
            startTime = new moment(algTime, dateFormat);
            startHour = parseInt(start.split(timeSplitter)[0], 10);
            timeSpan.start = startTime.format(dateFormat);
        }
        if (end) {
            endHour = parseInt(end.split(timeSplitter)[0], 10);
        }
        //endHour should greater than startHour, except 23: 47 ~ 00:00
        if (endHour !== undefined && startHour !== undefined && endHour < startHour) {
            if (endHour !== 0) {
                msg.warn('make sure the time of is right of '+ date + '\'s log: ' + log);
            } else {
                plusOneDay = true;
            }
        }
        if (startHour === 0) {
            plusOneDay = true;
        }
        if (end) {
            endTime = new moment(date + ' ' + end, dateFormat);
            if (plusOneDay) {
                endTime.add(1, 'd');
            }
            timeSpan.end = endTime.format(dateFormat);
        }
        if (end && start) {
            timeSpan.len = endTime.diff(startTime, 'minutes');
        }
    } else {
        console.log(result);
        msg.warn('make sure the time is right of ' + date +'\'s log: ' + log);
    }
    return timeSpan;
}

/**
 * get the detail log info
 * @param log
 * @param date
 * @param index
 */
function getLogInfo(config) {
    var log = config.logStr;
    var logInfo = {
        classes: getSimpleClasses(log),
        tags: getSimpleTags(log),
        projects: getSimpleProjects(log),
        sign: getSigns(log),
        index: config.index,
        origin: log
    };
    var timeSpan = getTimeSpanFromLog(log, config);
    return extend(logInfo, timeSpan);
}


function getTimeSpan(start, end) {
    var diff = -1;
    if (end && start) {
        var dateFomate = 'YYYY-MM-DD HH:mm';
        var startTime = new moment(start, dateFomate),
            endTime = new moment(end, dateFomate);
        diff = endTime.diff(startTime, 'minutes');
    }
    return diff;
}

function getHourFromDateStr(dateStr) {
    var timeRegxp = /\d{1,2}\s*:\s*\d{1,2}/ig;
    var timeStr = dateStr.match(timeRegxp)[0];
    var timeArr = timeStr.split(timeSplitter).map(trim);
    return timeArr[0];
}

function isEmpty(val) {
    return !!val.trim();
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

function groupTimeByTag (logs) {
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


function groupTimeByLogClass(logs, classes) {
    var classesTime = [];
    function calculateClassesTimeConsume(logs, cls) {
        var totalTime = 0;
        logs.forEach(function(log) {
            var classes = log.classes;
            if (classes && classes.indexOf(cls) >= 0) {
                totalTime += log.len;
            }
        });
        return totalTime;
    }
    classes.forEach(function(cls) {
        var consumeTime = calculateClassesTimeConsume(logs, cls.code);
        classesTime.push({
            label: cls.name,
            count: consumeTime
        });
    });
    return classesTime;
}


function groupTimeByProject(logs) {
    return groupTimeBy(logs, 'projects', function (label) {
        label = label.split(':')[0];
        label = label.split(' ')[0];
        return label;
    }, function (label, target) {
        return label.indexOf(target) === 0;
    });
}

function groupTimeBy (logs, condition, process, filter) {
    var result = [];
    logs.forEach(function (log) {
        var items = log[condition];
        if (items && items.length) {
            items.forEach(function (item) {
                var target = result.filter(function (resultItem) {
                    if (filter) {
                        return filter(resultItem.label, item);
                    } else {
                        return resultItem.label === item;
                    }
                });
                if (target && target.length) {
                    target[0].count += log.len;
                } else {
                    if (typeof process === 'function') {
                        item = process(item);
                    }
                    result.push({
                        label: item,
                        count: log.len
                    });
                }
            });
        }
    });
    return result;
}


function getProjects(log) {
    return getItem(log, /<.*?>/g, /[<>]/g, Object);
}


function getSimpleProjects(log) {
    return getItem(log, /<.*?>/g, /[<>]/g, String);
}


function getItem(data, regexp, replace, type){

    var result = data.match(regexp);
    if (!result) {
        return [];
    }
    result = result.map(function(itemStr) {
        return itemStr.trim().replace(replace, '').trim();
    });
    if (type === Object) {
        result = result.reduce(function(pv, cv) {
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
    } else {
        result = result.filter(onlyUnique);
    }

    return result;
}


/**
 * checkLogSequence
 * 检查日志的时序是否正确
 * 确保不会出现类似下面的日志
 *
 *    9:00 ~ 11: 00
 *   10:49 ~ 12:00
 *
 * @param logs
 * @return
 */
function checkLogSequence(logs) {
    var checkResult = true;
    logs.reduce(function (pv, cv) {
        var pvEnd = new moment(pv.end, dateFormat),
            cvStart = new moment(cv.start, dateFormat);
        if (cvStart.diff(pvEnd, 'minute') < 0) {
            checkResult = false;
            msg.warn('The sequence of "' + pv.origin + '" and "' + cv.origin + '" of  ' +  pvEnd.format('YYYY-MM-DD') + ' is not right.');
        }
        return cv;
    });
    return checkResult;
}

exports.getLogClasses = getLogClasses;
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
exports.groupTimeByTag = groupTimeByTag;
exports.groupTimeByLogClass = groupTimeByLogClass;
exports.groupTimeByProject = groupTimeByProject;
exports.getSigns = getSigns;
exports.getProjects = getProjects;
exports.getSimpleProjects = getSimpleProjects;
exports.checkLogSequence = checkLogSequence;
