/**
 * 运动日志
 *
 * 单次运动
 *  type: fitness 健身,short 短运, morning 晨运,swimming 游泳
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
    extend = require('node.extend'),
    util = require('../util'),
    msg = require('../message'),
    helper = require('./helper'),
    sportType = require('../conf/sportType'),
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
            .then(deferred.resolve.bind(deferred))
            .catch(deferred.reject.bind(deferred));
    }
    return deferred.promise;
}


function getSportLogs(fileData) {
    var logData = fileData.data,
        date = fileData.date;
    var logs = helper.getLogs(logData, date);

    var sportLogs = logs.filter(function (log) {
        var sportClassName = config.className;
        if (log.classes) {
            return log.classes.filter(function (cls) {
                return sportClassName.indexOf(cls) >= 0;
            }).length > 0;
        }
        return false;
    });
    fileData.logs = sportLogs;
    return fileData;
}

function calculate(fileData) {
    var logs = fileData.logs;
    var sportLogs = [];
    var statResult = {
        time: 0,
        count: 0,
        logs: sportLogs,
        origin: fileData
    };
    logs.forEach(function (log) {
        var sportLog = {
            time: log.len,
            start: log.start,
            end: log.end
        };
        var type = sportType.get(log.tags);
        if (type.length === 0) {
            msg.warn('Unknow sport type:' + log.tags.join(','));
        }
        sportLog.type = type;
        sportLog.items = getSportItems(log.projects);
        sportLogs.push(sportLog);
        statResult.count++;
        statResult.time += log.len;
    });
    return statResult;

    function getSportItems(projects) {
        var SPLITTER = ':';
        var items = [];
        projects.forEach(function (proj) {
            // push-up:10s4r means push-up 10 sets, 4reps
            if (proj.indexOf(SPLITTER)) {
                var result = transform(proj);
                items.push(result);
            } else {
                items.push({
                    name: proj
                });
            }

            function transform(proj) {
                var projInfo = proj.split(SPLITTER),
                    getSetsAndReps = function (str) {
                        //format: \ds\dr example: 10s9r
                        var regexp = /^(\d+)s(\d+)r$/g,
                            result = regexp.exec(str);
                        if (result.length < 3) {
                            return null;
                        }
                        return {
                            sets: parseInt(result[1], 10),
                            reps: parseInt(result[2], 10)
                        };
                    };
                var setsAndReps = getSetsAndReps(projInfo[1].trim());
                if (setsAndReps === null) {
                    msg.warn('Sport item record is wrong:' + proj + 'in ' +
                            fileData.date);
                }
                return extend({
                    name: projInfo[0].trim()
                }, setsAndReps);
            }
        });
        return items;
    }
}


exports.dispose = dispose;
