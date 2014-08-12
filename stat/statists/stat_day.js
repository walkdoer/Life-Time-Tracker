'use strict';

var util = require('../util');
var when = require('when');
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
        .then(calculate)
        .then(function (file) {
            output(file, showOriginLogs);
        })
        .catch (handleError);
};

exports.calculate = function (dateArr) {
    var deferred = when.defer();
    var year = parseInt(dateArr[0]);
    var month = parseInt(dateArr[1]);
    var day = parseInt(dateArr[2]);
    if (!util.isDayValid(year, month, day)) {
        throw new Error('day ' + day + ' is out of the day range of month ' + month);
    }
    util.readLogFiles(dateArr.join('-'))
        .then(function (fileData) {
            var result = calculate(fileData);
            deferred.resolve(result);
        })
        .catch (function () {
            deferred.reject();
        });

    return deferred.promise;
};

function calculate(fileData) {
    var date = fileData.date,
        totalMins = 0,
        logs,
        wakeTime,
        sleepTime;
    var logData = fileData.data;
    fileData.logs = logs = helper.getLogs(logData, date);
    fileData.classes = helper.getClasses(logData).sort(frequenceDesc);
    fileData.tags = helper.getTags(logData).sort(frequenceDesc);
    function frequenceDesc(a, b) {
        return b.frequence - a.frequence;
    }
    logs.forEach(function(log) {
        if (log.wake) {
            wakeTime = log.time;
        } else if (log.sleep){
            sleepTime = log.time;
        } else if (log.offDuty) {
            fileData.offDutyTime = log.time;
        }
        if (log.len !== undefined) {
            totalMins += log.len;
        }
    });
    //all the tracked time from the log
    fileData.totalMins = totalMins;
    fileData.wakeTime = wakeTime;
    fileData.sleepTime = sleepTime;
    fileData.allActiveTime = helper.timeSpan(wakeTime, sleepTime);
    fileData.sleepLength = calculateSleepLength(fileData);
    return fileData;
}


function calculateSleepLength (data) {
    var nextDay = helper.nextDay(data.date),
        timeSpan = -1,
        file;
    try {
        file = util.readLogFilesSync(nextDay);
        var wokeTime = helper.getWakeTime(file.data, nextDay);
        var sleepTime = data.sleepTime;
        timeSpan = helper.timeSpan(sleepTime, wokeTime);
    } catch (e) {
        if (e.code === 'ENOENT') {
            msg.warn('do not have enough data to calculate sleep lenth');
        } else {
            msg.error('error occur when calculate sleep time');
        }
    }
    return timeSpan;
}

function generateBasicInfo(data) {
    return data.date + ' have ' + data.logNum + ' logs and ' + data.tagNum + ' tags;';
}

function output(fileData, showOriginLogs) {

    var tags = fileData.tags,
        logs = fileData.logs,
        date = fileData.date,
        allActiveTime = fileData.allActiveTime,
        classes = fileData.classes;
    //calculate total time
    var totalMins = fileData.totalMins,
        totalHours = totalMins / 60,
        wakeTime = fileData.wakeTime,
        sleepTime = fileData.sleepTime;
    //out put the basic info of the log
    msg.info(generateBasicInfo({
        date: date,
        tagNum: tags.length,
        logNum: logs.length
    }));
    msg.log('起床时间: ' + wakeTime);
    if (fileData.offDutyTime) {
        msg.log('下班时间: ' + fileData.offDutyTime);
    }
    msg.log('睡觉时间: ' + sleepTime);

    var allActiveHours;
    if (allActiveTime > 0) {
        allActiveHours = allActiveTime / 60;
        msg.log('All active time: ' + allActiveTime.toString().cyan + ' mins;' + allActiveHours.toFixed(2).cyan + ' h');
        msg.log('Untracked time: ' + (allActiveTime - totalMins + '').cyan + ' mins');
    }
    msg.log('Total time: ' + totalMins.toString().cyan + ' mins; ' + totalHours.toFixed(2).cyan + ' h');


    var sleepLength = fileData.sleepLength;
    if (sleepLength > 0) {
        var hours = sleepLength / 60,
            warnMsg = '';
        if (hours < 7) {
            warnMsg = 'WARN sleepTime is not enough'.yellow;
        }
        console.log('Sleep length: ' + hours.toFixed(2).cyan + 'h ' + warnMsg);
    }

    //output the tags which has been sorted by frequence
    msg.log('Tags: '.bold + tags.map(readNameAndFrequence).join(', ').italic.blue);
    //output the classes which has been sorted by frequence
    msg.log('Classes: '.bold + classes.map(readNameAndFrequence).join(', ').magenta);

    /**
     * read the class or tagName and it's frequence
     * @return
     */
    function readNameAndFrequence(obj) {
        return obj.name + '(' + obj.frequence + ')';
    }
    //output every classes time consume
    msg.log('========== Group By Classes =========='.white);
    var classesTime = helper.groupTimeByClass(logs, fileData.classes);
    display.bar(classesTime);

    msg.log('========== Group By Tags =========='.white);
    var tagTime = helper.groupTimeByTag(logs);
    display.bar(tagTime);

    if (showOriginLogs) {
        console.log('========== Origin Logs ============'.white);
        console.log(fileData.data);
    }
    return fileData;
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
