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


var extend = require('node.extend'),
    msg = require('../../message'),
    logClassEnum = require('../../enum/logClass'),
    sportType = require('../../conf/sportType');

exports.focus = function (options, scanResult) {
    processSportLog(scanResult);
    var statResult = stat(scanResult);
    return statResult;
};



function processSportLog(day) {
    var logs = day.logs;
    var sportLogs = [];
    var count = 0,
        time = 0;
    logs.forEach(function (log) {
        if (!isSportLog(log)) {
            return;
        }
        var tags = log.tags;
        var sportLog = {
            time: log.len,
            start: log.start,
            end: log.end
        };
        var type = sportType.get(tags);
        if (type.length === 0) {
            msg.warn('Unknow sport type:' + (tags || []).join(','));
        }
        sportLog.type = type;
        //sportLog.items = getSportItems(log.projects);
        sportLogs.push(sportLog);
        count++;
        time += log.len;
    });

    function isSportLog(log) {
        return log.classes && log.classes.filter(function (cls) {
            return cls.code === logClassEnum.Sport;
        }).length > 0;
    }

    day.time = time;
    day.count = count;
    day.sportLogs = sportLogs;
}

exports.processSportLog = processSportLog;

function stat(scanResult) {
    var datas = scanResult.days || [scanResult];
    var result = datas.reduce(function (result, day) {
        var sportTypeTime = result.sportTypeTime;
        result.count += day.count;
        result.time += day.time;

        day.sportLogs.forEach(function (log) {
            //根据运动种类进行time group
            groupTimeBySportType(log);
            //根据运动项目进行time group
            //sumSportItem(log.items);
        });

        function groupTimeBySportType (log) {
            log.type.forEach(function (type) {
                var item = getTimeItemTimeByType(type);
                if (item) {
                    item.count += log.time;
                } else {
                    sportTypeTime.push({
                        type: type,
                        count: log.time
                    });
                }
            });
        }


        function getTimeItemTimeByType(type) {
            return sportTypeTime.filter(function (timeItem) {
                return timeItem.type.en === type.en;
            })[0] || null;
        }
        return result;
    }, {
        count: 0,
        time: 0,
        sportTypeTime: [],
        sportItemSum: {}
    });

    return result;
}

exports.stat = stat;
