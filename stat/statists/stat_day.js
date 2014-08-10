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
        .then(preprocessData)
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

/**
 * preprocess the file data,extract tags and classes
 *
 * @param fileData
 * @return
 */
function preprocessData(fileData) {
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
            msg.log('Wake Time: ' + wakeTime);
        } else if (log.sleep){
            sleepTime = log.time;
            msg.log('Sleep Time: ' + sleepTime);
        }
        if (log.len !== undefined) {
            totalMins += log.len;
        }
    });
    //all the tracked time from the log
    fileData.totalMins = totalMins;
    fileData.wakeTime = wakeTime;
    fileData.sleepTime = sleepTime;
    return fileData;
}


function analyse(fileData) {
    var tags = fileData.tags,
        classes = fileData.classes,
        logs = fileData.logs;
    var date = fileData.date;
    //out put the basic info of the log
    msg.info(generateBasicInfo({
        date: date,
        tagNum: tags.length,
        logNum: logs.length
    }));
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


    //calculate total time
    var totalMins = fileData.totalMins,
        totalHours = totalMins / 60,
        wakeTime = fileData.wakeTime,
        sleepTime = fileData.sleepTime;
    var allActiveTime = helper.timeSpan(wakeTime, sleepTime),
        allActiveHours;
    if (allActiveTime > 0) {
        allActiveHours = allActiveTime / 60;
        msg.log('All active time: ' + allActiveTime.toString().cyan + ' mins;' + allActiveHours.toFixed(2).cyan + ' h');
        msg.log('Untracked time: ' + (allActiveTime - totalMins + '').cyan + ' mins');
    }
    msg.log('Total time: ' + totalMins.toString().cyan + ' mins; ' + totalHours.toFixed(2).cyan + ' h');


    //output every classes time consume
    msg.log('========== Group By Classes =========='.white);
    var classesTime = helper.groupTimeByClass(logs, fileData.classes);
    display.bar(classesTime);

    msg.log('========== Group By Tags =========='.white);
    var tagTime = helper.groupTimeByTag(logs);
    display.bar(tagTime);
    return fileData;
}


function calculateSleepLength (data) {
    var nextDay = helper.nextDay(data.date);
    util.readLogFiles(nextDay)
        .then(function (file) {
            var wokeTime = helper.getWakeTime(file.data, nextDay);
            var sleepTime = data.sleepTime;
            var timeSpan = helper.timeSpan(sleepTime, wokeTime);
            console.log('Sleep length: ' + (timeSpan / 60).toFixed(2).cyan + 'h');
        })
        .catch(function () {
            msg.error('Not enough data to calculate sleep length.');
        });
    return data;
}

function generateBasicInfo(data) {
    return data.date + ' have ' + data.logNum + ' logs and ' + data.tagNum + ' tags;';
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

