/**
 * life overview perspective
 */
'use strict';

var msg = require('../../message');
var util = require('../../util');
var helper = require('../../helper');

exports.focus = function (date, scanResult) {
    var fileContent = scanResult.fileContent,
        logs = scanResult.logs,
        trackedTime = 0,
        wakeMoment,
        lastMoment,
        sleepMoment;
    var statResult = {
        date: date,
        options: scanResult.options,
        logs: scanResult.logs
    };

    //check the correctness of time frequence for the logs
    helper.checkLogSequence(logs);
    statResult.classes = helper.getLogClasses(fileContent, true/*unique*/).sort(frequenceDesc);
    statResult.tags = helper.getTags(fileContent).sort(frequenceDesc);
    statResult.projects = helper.getProjects(fileContent);
    statResult.projectsFrequence = util.frequence(statResult.projects, function (value, target) {
        return value.name === target.name;
    });

    //last index of the logs
    var lastIndex = logs.length - 1;
    logs.forEach(function(log, index) {
        if (log.wake) {
            wakeMoment = log.time;
        } else if (log.sleep){
            sleepMoment = log.time;
        } else if (log.offDuty) {
            statResult.offDutyMoment = log.time;
        }
        if (log.len !== undefined) {
            trackedTime += log.len;
        }
        if (lastIndex === index) {
            lastMoment = log.end;
        }
    });

    //calculate the activeTime and unTrackedTime
    var activeTime = 0, unTrackedTime;
    activeTime = helper.timeSpan(wakeMoment, sleepMoment || lastMoment);
    unTrackedTime = activeTime - trackedTime;
    //validate the activeTime and unTrackedTime
    checkActiceTime(activeTime, unTrackedTime);

    //store the stat result
    statResult.trackedTime = trackedTime;
    statResult.wakeMoment = wakeMoment;
    statResult.sleepMoment = sleepMoment;
    statResult.activeTime = activeTime;
    statResult.unTrackedTime = unTrackedTime;
    statResult.sleepTime = calculateSleepLength(date, sleepMoment);
    statResult.classTime = helper.groupTimeByLogClass(logs, statResult.classes);
    statResult.tagTime = helper.groupTimeByTag(logs);
    statResult.projectTime = helper.groupTimeByProject(logs);
    return statResult;
    function frequenceDesc(a, b) {
        return b.frequence - a.frequence;
    }

    function checkActiceTime(activeTime, unTrackedTime) {
        if (unTrackedTime < 0) {
            msg.error(date + '\'s trackedTime is bigger than activeTime, that\'s impossible. ' + 'trackedTime = ' + trackedTime + ' activeTime = ' + activeTime);
        } else if (unTrackedTime > 200) {
            msg.warn(date + '\'s untrackedTime is too much untrackedTime = ' + unTrackedTime);
        }
    }
};


function calculateSleepLength (date, sleepMoment) {
    var nextDay = helper.nextDay(date),
        timeSpan = -1,
        file;
    try {
        file = util.readLogFilesSync(nextDay);
        var wokeTime = helper.getWakeTime(file.data, nextDay);
        timeSpan = helper.timeSpan(sleepMoment, wokeTime);
    } catch (e) {
        if (e.code === 'ENOENT') {
            msg.warn('Do not have enough data to calculate sleep lenth of ' + date);
        } else {
            msg.error('error occur when calculate sleep time of ' + date);
            throw e;
        }
    }
    return timeSpan;
}
