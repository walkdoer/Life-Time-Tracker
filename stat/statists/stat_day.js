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
        trackedTime = 0,
        logs,
        wakeMoment,
        sleepMoment;
    var logData = fileData.data;
    fileData.logs = logs = helper.getLogs(logData, date);
    fileData.classes = helper.getClasses(logData).sort(frequenceDesc);
    fileData.tags = helper.getTags(logData).sort(frequenceDesc);
    function frequenceDesc(a, b) {
        return b.frequence - a.frequence;
    }
    logs.forEach(function(log) {
        if (log.wake) {
            wakeMoment = log.time;
        } else if (log.sleep){
            sleepMoment = log.time;
        } else if (log.offDuty) {
            fileData.offDutyTime = log.time;
        }
        if (log.len !== undefined) {
            trackedTime += log.len;
        }
    });
    //all the tracked time from the log
    fileData.trackedTime = trackedTime;
    fileData.wakeMoment = wakeMoment;
    fileData.sleepMoment = sleepMoment;
    fileData.activeTime = helper.timeSpan(wakeMoment, sleepMoment);
    fileData.sleepTime = calculateSleepLength(fileData);
    fileData.classTime = helper.groupTimeByClass(logs, fileData.classes);
    fileData.tagTime = helper.groupTimeByTag(logs);
    return fileData;
}


function calculateSleepLength (data) {
    var nextDay = helper.nextDay(data.date),
        timeSpan = -1,
        file;
    try {
        file = util.readLogFilesSync(nextDay);
        var wokeTime = helper.getWakeTime(file.data, nextDay);
        var sleepMoment = data.sleepMoment;
        timeSpan = helper.timeSpan(sleepMoment, wokeTime);
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
        activeTime = fileData.activeTime,
        classes = fileData.classes;
    //calculate total time
    var trackedTime = fileData.trackedTime,
        totalHours = trackedTime / 60,
        wakeMoment = fileData.wakeMoment,
        sleepMoment = fileData.sleepMoment;
    //out put the basic info of the log
    msg.info(generateBasicInfo({
        date: date,
        tagNum: tags.length,
        logNum: logs.length
    }));
    msg.log('起床时间: ' + wakeMoment);
    if (fileData.offDutyTime) {
        msg.log('下班时间: ' + fileData.offDutyTime);
    }
    msg.log('睡觉时间: ' + sleepMoment);

    var allActiveHours;
    if (activeTime > 0) {
        allActiveHours = activeTime / 60;
        msg.log('Active Time:' + activeTime.toString().cyan + ' mins;' + allActiveHours.toFixed(2).cyan + ' h');
        msg.log('有记录时间: ' + trackedTime.toString().cyan + ' mins; ' + totalHours.toFixed(2).cyan + ' h');
        msg.log('未记录时间: ' + (activeTime - trackedTime + '').cyan + ' mins');
    }


    var sleepTime = fileData.sleepTime;
    if (sleepTime > 0) {
        var hours = sleepTime / 60,
            warnMsg = '';
        if (hours < 7) {
            warnMsg = 'WARN sleepMoment is not enough'.yellow;
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
    display.bar(fileData.classTime);

    msg.log('========== Group By Tags =========='.white);
    display.bar(fileData.tagTime);

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
