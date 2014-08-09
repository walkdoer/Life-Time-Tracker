'use strict';

var util = require('../util');
var msg = require('../message');
var helper = require('./helper');
var display = require('../dislpay_data');

exports.stat = function(dateArr, showOriginLogs) {
    var year = parseInt(dateArr[0]);
    var month = parseInt(dateArr[1]);
    var day = parseInt(dateArr[2]);
    if (!util.isDayValid(year, month, day)) {
        throw new Error('day ' + day + ' is out of the day range of month ' + month);
    }
    util.readLogFiles(dateArr.join('-'))
        .then(analyse)
        .then(calculateSleepLength)
        .then(function (fileData) {
            if (showOriginLogs) {
                console.log('========== Origin Logs ============'.white);
                console.log(fileData.data);
            }
            return fileData;
        })
        .catch (handleError);
};


function analyse(fileData) {
    var date = fileData.date;
    var logData = fileData.data;
    var logs = helper.getLogs(logData);
    var classes = helper.getClasses(logData).sort(frequenceDesc);
    var tags = helper.getTags(logData).sort(frequenceDesc);
    msg.info(getBasicInfo({
        date: date,
        tagNum: tags.length,
        logNum: logs.length
    }));
    msg.log('Tags: '.bold + tags.map(readNameAndFrequence).join(', ').italic.blue);
    msg.log('Classes: '.bold + classes.map(readNameAndFrequence).join(', ').magenta);

    /**
     * read the class or tagName and it's frequence
     * @return
     */
    function readNameAndFrequence(obj) {
        return obj.name + '(' + obj.frequence + ')';
    }

    function frequenceDesc(a, b) {
        return b.frequence - a.frequence;
    }

    //calculate total time
    var totalMins = 0;
    var logInfoArr = [];
    var lastIndex = logs.length - 1;
    var startTime, endTime;
    logs.forEach(function(log, index) {
        var logInfo = helper.getLogInfo(log, date, index);
        if (logInfo) {
            if (isGetUpLog(logInfo)) {
                logInfo.getup = true;
                startTime = date + ' ' + logInfo.start;
                msg.log('Get Up Time: ' + logInfo.start);
            } else if (isSleepTime(logInfo, lastIndex)){
                var hour = parseInt(helper.getHour(logInfo.start), 10);
                if (hour === 0) {
                    endTime = helper.nextDay(date) + ' ' + logInfo.start;
                } else {
                    endTime = date + ' ' + logInfo.start;
                }
                msg.log('Sleep Time: ' + logInfo.start);
            }
            if (logInfo.len !== undefined) {
                totalMins += logInfo.len;
            } else if (!logInfo.start) {
                logInfo.len = 0;
                msg.warn('May be there\' something wrong with you time format of this log: ' +
                    log);
            }
            logInfoArr.push(logInfo);
        }
    });
    var totalHours = totalMins / 60;
    var allActiveTime = helper.timeSpan(startTime, endTime),
        allActiveHours = allActiveTime / 60;
    msg.log('All active time: ' + allActiveTime.toString().cyan + ' mins;' + allActiveHours.toFixed(2).cyan + ' h');
    msg.log('UnTracked time: ' + (allActiveTime - totalMins + '').cyan + ' mins');
    msg.log('Total time: ' + totalMins.toString().cyan + ' mins; ' + totalHours.toFixed(2).cyan + ' h');


    //output every classes time consume
    msg.log('========== Group By Classes =========='.white);
    var classesTime = [];
    classes.forEach(function(cls) {
        var consumeTime = calculateClassesTimeConsume(logInfoArr, cls.name);
        classesTime.push({
            label: cls.name,
            count: consumeTime
        });
        //msg.log(cls.name.bold + ': ' + (consumeTime / 60).toFixed(2).cyan + ' hours');
    });

    display.bar(classesTime);

    msg.log('========== Group By Tags =========='.white);
    var tagTime = groupTimeByTags(logInfoArr);
    display.bar(tagTime);
    fileData.date = date;
    fileData.sleepTime = endTime;
    return fileData;
}


function calculateSleepLength (data) {
    var nextDay = helper.nextDay(data.date);
    util.readLogFiles(nextDay)
        .then(function (file) {
            var wokeTime = nextDay + ' ' + getWokeTime(file.data);
            var sleepTime = data.sleepTime;
            var timeSpan = helper.timeSpan(sleepTime, wokeTime);
            console.log('sleep time: ' + (timeSpan / 60).toFixed(2).cyan + 'h');
        })
        .catch(function () {
            msg.error('Not enough data to calculate sleep length.');
        });
    return data;
}

function getBasicInfo(data) {
    return data.date + ' have ' + data.logNum + ' logs and ' + data.tagNum + ' tags;';
}

function isGetUpLog(log) {
    return log.start && !log.end && log.index === 0;
}

function isSleepTime(log, lastIndex) {
    return log.start && !log.end && log.index === lastIndex;
}

function getWokeTime(logData) {
    var logs = helper.getLogs(logData);
    return logs[0];
}

function handleError(err) {
    if (err.code === 'ENOENT') {
        msg.error('can\' find log file ' + err.path +
            ', please check the existence of the file');
    } else {
        msg.error(err.message);
        throw err;
    }
}

function calculateClassesTimeConsume(logInfoArr, cls) {
    var totalTime = 0;
    logInfoArr.forEach(function(log) {
        var classes = log.classes;
        if (classes && classes.indexOf(cls) >= 0) {
            totalTime += log.len;
        }
    });
    return totalTime;
}

function groupTimeByTags (logInfoArr) {
    var result = [];
    logInfoArr.forEach(function (log) {
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
