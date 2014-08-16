'use strict';

var util = require('../util');
var when = require('when');
var msg = require('../message');
var db = require('../model/db');
var helper = require('./helper');
var display = require('../dislpay_data'),
    Log = require('../model/log'),
    moment = require('moment'),
    logType = require('../enum/logType'),
    DayStat = require('../model/dayStat');


exports.dispose = function (config) {

    /**
     * 先从数据库读取数据，如果没有，再执行日志统计
     */
    var condition = { id: config.dateStr };
    DayStat.find(condition, function (err, result) {
        if (err) {
            throw err;
        }

        if (result.length) {
            var statResult = result[0].toJSON();
            statResult.date = statResult.id;
            Log.find({date: config.dateStr}, function (err, result) {
                if (err) {
                    throw err;
                }
                statResult.logs = result;
                output(statResult);
                db.disconnect();
            });
        } else {
            stat(config);
        }
    });
};

function stat(config) {
    var dateArr = config.dateStr.split('-').map(function (val){
        return parseInt(val, 10);
    });
    var year = dateArr[0];
    var month = dateArr[1];
    var day = dateArr[2];
    if (!util.isDayValid(year, month, day)) {
        throw new Error('day ' + day + ' is out of the day range of month ' + month);
    }
    util.readLogFiles(config.dateStr)
        .then(calculate)
        .then(function (statResult) {
            persistent(statResult);
            output(statResult, config.showOriginLogs);
        })
        .catch (handleError);
}

exports.stat = stat;


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
    var UNRECORDED = '未记录';

    var tags = fileData.tags,
        logs = fileData.logs,
        date = fileData.date,
        activeTime = fileData.activeTime,
        classes = fileData.classes;
    //calculate total time
    var trackedTime = fileData.trackedTime,
        totalHours = trackedTime / 60,
        wakeMoment = new moment(fileData.wakeMoment),
        sleepMoment = new moment(fileData.sleepMoment);
    //out put the basic info of the log
    msg.info(generateBasicInfo({
        date: date,
        tagNum: tags.length,
        logNum: logs.length
    }));
    msg.log('起床时间: ' + wakeMoment.format(helper.dateFormat));
    if (fileData.offDutyTime) {
        msg.log('下班时间: ' + fileData.offDutyTime);
    }
    msg.log('睡觉时间: ' + (sleepMoment.format(helper.dateFormat) || UNRECORDED.red));

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
        console.log('睡眠长度: ' + hours.toFixed(2).cyan + 'h ' + warnMsg);
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


function persistent(statResult) {
    var date = statResult.date;
    statResult.id = date;
    //检查数据库是否已存在改天的记录
    DayStat.find({
        id: statResult.id
    }, function (err, result) {
        if (result.length === 0) {
            var dayStat = new DayStat(statResult);
            dayStat.save(function (err) {
                if (err) {
                    msg.error('save to database failed');
                    throw err;
                }
                msg.info('save to database success');
            });
        } else {
            msg.warn('record already in database, if need update --update');
            db.disconnect();
        }
    });
    var logs = statResult.logs;

    logs.forEach(function(log) {
        log.date = date;
        var classes = log.classes,
            tags = log.tags;
        if (classes && classes.indexOf('RB') >= 0) {
            log.type = logType.ReadBook;
        } else if (tags && tags.indexOf('健身') >= 0){
            log.type = logType.Fitness;
        } else {
            log.type = logType.Normal;
        }
        // Todo
        log.note = '';
        log.projects = [];
        new Log(log).save();
    });
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
