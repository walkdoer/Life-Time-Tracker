'use strict';
var fs = require('fs'),
    path = require('path'),
    moment = require('moment'),
    notifier = require('../notifier');

var helper = require('../helper');
var workdayPlanFile = fs.readFileSync(
        path.resolve(__dirname, '../plan/workday.md'), 'utf8');
var globalConfig = require('../conf/config.json');


var todayStr = moment().format('YYYY-MM-DD');
var planLogs = helper.getLogs(workdayPlanFile, todayStr);

exports.watch = function () {
    var planWatchCfg = globalConfig.watcher.plan;
    var ahead = planWatchCfg.ahead;
    var step = planWatchCfg.step;

    /**
     * check if there is available task
     */
    setInterval(function () {
        //if comes to midnight, then need to read the new plan
        if (isMidnight()) {
            todayStr = moment().format('YYYY-MM-DD');
            planLogs = helper.getLogs(workdayPlanFile, todayStr);
        }
        var now = new moment();
        var tasks = getNextTask(now, ahead, step);
        if (tasks && tasks.length > 0) {
            notifier.notify(generateMsg(tasks), {
                execute: 'mkdir ~/testhometest'
            });
        }
    }, 1000);
};


function isMidnight() {
    return moment().hour() === 0;
}

function getNextTask(now, ahead, step) {
    return planLogs.filter(function (log) {
        var start = new moment(log.start);
        var timeSpan = start.diff(now, 'minute');
        var fromLastNotified = -1;
        if (log.lastNotified) {
            fromLastNotified = now.diff(log.lastNotified, 'minute');
        } else {
            fromLastNotified = Number.MAX_VALUE;
        }
         /*notify ahead of [ahead] minutes before task begin, and notify every [step] minutes since then.*/
        if (timeSpan > 0 && timeSpan <= ahead && fromLastNotified >= step) {
            log.beforeStart = start.diff(now);
            log.lastNotified = now;
            return true;
        } else if (timeSpan === 0 && !log.started) {
            log.beforeStart = 0;
            log.lastNotified = now;
            log.started = true;
            return true;
        }
    });
}


function generateMsg(tasks) {
    var messages = [];
    tasks.forEach(function (task) {
        var logClass = task.classes[0],
            tags = task.tags,
            beforeStart = task.beforeStart,
            startMoment = new moment(task.start),
            content = '';

        var title = '';
        if(logClass) {
            title += logClass.name + '提醒';
        } else {
            title = '日程提醒';
        }
        if (tags && tags.length > 0) {
            title += ' ' + tags.join(' ');
        }
        content += (task.content || '');
        content += '预估耗时: ' + getReadableTime(task.len, 'minute');
        var subTitle;
        if (beforeStart === 0) {
            subTitle = '任务应该要开始了';
        } else {
            subTitle = '开始时间:' + startMoment.format('HH:mm') +
            '，还有' + getReadableTime((beforeStart / 60000), 'minute');
        }
        messages.push({
            title: title,
            subTitle: subTitle,
            content: content
        });
    });
    return messages;
}

/**
 * get time that is easy to read
 */
function getReadableTime(time, type) {
    var readableTime;
    if (type === 'minute') {
        readableTime = time < 60 ? Math.round(time) + '分钟' :
            (time / 60).toFixed(2) + '小时';
    }
    return readableTime;
}

exports.watch();
