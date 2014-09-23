'use strict';
var fs = require('fs'),
    path = require('path'),
    moment = require('moment'),
    notifier = require('../notifier');
var _ = require('lodash');

var helper = require('../helper');
var workdayPlanFile = fs.readFileSync(
        path.resolve(__dirname, '../plan/workday.md'), 'utf8');
var globalConfig = require('../conf/config.json');

//defaul config
var planWatchCfg = _.extend({
    ahead: 5,
    aheadOfDone: 0
}, globalConfig.watcher.plan);

var todayStr = moment().format('YYYY-MM-DD');
var planLogs = helper.getLogs(workdayPlanFile, todayStr);

var PlanWatcher = function (options) {
    this.ahead = parseInt(options.ahead || planWatchCfg.ahead, 10);
    this.aheadOfDone = parseInt(options.aheadOfDone || planWatchCfg.aheadOfDone, 10);
    this.interval = parseInt(options.interval || planWatchCfg.interval, 10);
    this.name = '任务监控';
};

PlanWatcher.prototype.watch = function () {
    var ahead = this.ahead,
        aheadOfDone = this.aheadOfDone;
    var interval = this.interval;

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
        var tasks = getNextTask(now, ahead, interval);
        if (tasks && tasks.length > 0) {
            notifier.notify(generateStartMsg(tasks), {
                execute: 'open ~/testhometest'
            });
        }
        //if there is any task that almost done, remind ahead of [aheadOfDone] mins
        var almostDoneTasks = getAlmostDoneTask(now, aheadOfDone);
        if (almostDoneTasks && almostDoneTasks.length > 0) {
            notifier.notify(generateEndMsg(almostDoneTasks));
        }
    }, 1000);
};


function isMidnight() {
    return moment().hour() === 0;
}

function getNextTask(now, ahead, interval) {
    return planLogs.filter(function (log) {
        var start = new moment(log.start);
        var timeSpan = start.diff(now, 'minute');
        var fromLastNotified = -1;
        if (log.lastNotified) {
            fromLastNotified = now.diff(log.lastNotified, 'minute');
        } else {
            fromLastNotified = Number.MAX_VALUE;
        }
         /*notify ahead of [ahead] minutes before task begin, and notify every [interval] minutes since then.*/
        if (timeSpan > 0 && timeSpan <= ahead && fromLastNotified >= interval) {
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

function getAlmostDoneTask(now, ahead) {
    return planLogs.filter(function (log) {
        var end = new moment(log.end);
        var timeSpan = end.diff(now, 'minute');
        if (timeSpan >= 0 && timeSpan <= ahead && !log.notified) {
            log.beforeEnd = timeSpan;
            log.notified = true;
            return true;
        }
    });
}


function generateStartMsg(tasks) {
    var messages = [];
    tasks.forEach(function (task) {
        var logClass = task.classes[0],
            tags = task.tags,
            beforeStart = task.beforeStart,
            startMoment = new moment(task.start),
            content = '';
        var emojis = {
            'SPR': '💪',
            'WK': '🔨',
            'BRK': '💤',
            'TK': '🙇',
            'STU': '📚'
        };

        var title = '';
        if(logClass) {
            title += logClass.name + '开始提醒';
        } else {
            title = '开始提醒';
        }
        var emoji = emojis[logClass.code];
        if (emoji) {
            title = emoji + title;
        }
        if (tags && tags.length > 0) {
            title += ' ' + tags.join(',');
        }
        content += (task.content || '');
        content += '预估耗时: ' + getReadableTime(task.len, 'minute');
        var subtitle;
        if (beforeStart === 0) {
            subtitle = '任务应该要开始了';
        } else {
            subtitle = '开始时间:' + startMoment.format('HH:mm') +
            '，还有' + getReadableTime((beforeStart / 60000), 'minute');
        }
        messages.push({
            title: title,
            subtitle: subtitle,
            //appIcon: emoji,
            message: content
        });
    });
    return messages;
}

function generateEndMsg(tasks) {
    var messages = [];
    tasks.forEach(function (task) {
        var logClass = task.classes[0],
            tags = task.tags,
            endMoment = new moment(task.end),
            content = '';

        var title = '';
        if(logClass) {
            title += logClass.name + '结束提醒';
        } else {
            title = '结束提醒';
        }
        if (tags && tags.length > 0) {
            title += ' ' + tags.join(',');
        }
        content += (task.content || '');
        content += '已坚持了 ' + getReadableTime(task.len - task.beforeEnd, 'minute');
        var subtitle = '结束时间:' + endMoment.format('HH:mm') +
            '，剩下' + getReadableTime(task.beforeEnd, 'minute');
        messages.push({
            title: title,
            subtitle: subtitle,
            message: content
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

module.exports = PlanWatcher;
