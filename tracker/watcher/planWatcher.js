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
    setInterval(function () {
        var now = new moment();
        var tasks = getNextTask(now, planWatchCfg.ahead);
        if (tasks && tasks.length > 0) {
            notifier.notify(generateMsg(tasks));
        }
    }, 1000);
};

function getNextTask(now, ahead) {
    return planLogs.filter(function (log) {
        var start = new moment(log.start);
        var timeSpan = start.diff(now, 'minute');
        if (timeSpan >= 0 && timeSpan <= ahead && !log.notified) {
            log.beforeStart = start.diff(now);
            log.notified = true;
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
            content = '';

        var title = '';
        if(logClass) {
            title += logClass.name + '提醒';
        } else {
            title = '日程提醒';
        }
        if (tags && tags.length > 0) {
            title += tags.join(' ');
        }
        content += (task.content || '');
        content += '估计时间: ' + (task.len / 60).toFixed(2) + '小时';
        messages.push({
            title: title,
            subTitle: '距离开始还有' + (beforeStart / 60000).toFixed(1) + '分钟',
            content: content
        });
    });
    return messages;
}

exports.watch();
