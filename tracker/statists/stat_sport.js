/**
 * 健身日志
 *
 * 单次健身
 *  type: normal 正常健身 / short 短运 / morning 晨运
 *  items: 健身项目
 *      name: 项目名称
 *      sets: 组数
 *      reps: 次数
 *  time: 健身时间长度
 *  start: 开始时间
 *  end: 结束时间
 *
 * 综合统计
 *  time: 时间总和
 *  count: 健身次数
 *  frequence: 频率 frequence = count / 天数
 *
 */
'use strict';

var when = require('when'),
    util = require('../util'),
    helper = require('./helper'),
    config = require('../conf/sport');

function dispose (config) {
    var deferred = when.defer();
    var fileData = config.fileData;
    if (fileData) {
        deferred.resovle(calculate(getSportLogs(fileData)));
    } else {
        //读取文件，然后过滤出健身日志，然后对日志进行分析
        util.readLogFiles(config.dateStr)
            .then(getSportLogs)
            .then(calculate)
            .then(deferred.resolve.bind(deferred));
    }
    return deferred.promise;
}


function getSportLogs(fileData) {
    var logData = fileData.data,
        date = fileData.date;
    var logs = helper.getLogs(logData, date);

    var sportLogs = logs.filter(function (log) {
        var sportClassName = config.className;
        return log.classes.filter(function (cls) {
            return sportClassName.indexOf(cls) >= 0;
        }).length > 0;
    });
    fileData.logs = sportLogs;
    return fileData;
}

function calculate(fileData) {
    var logs = fileData.logs;
}


exports.dispose = dispose;
