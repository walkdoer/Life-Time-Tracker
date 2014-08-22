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
    msg = require('../message'),
    dateTypeEnum = require('../enum/dateType'),
    sportType = require('../conf/sportType');

exports.dispose = function (scanResult) {
    var options = scanResult.options,
        statResult = null;

    if (options.dateType === dateTypeEnum.Month) {
        scanResult.days.forEach(processSportLog);
        statResult = stat(scanResult);
    } else if (options.dateType === dateTypeEnum.Day) {
        statResult = stat(processSportLog(scanResult));
    }
    return statResult;
};



function processSportLog(day) {
    var logs = day.logs;
    var sportLogs = [];
    var count = 0,
        time = 0;
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
        count++;
        time += log.len;
    });

    day.time = time;
    day.count = count;
    day.sportLogs = sportLogs;

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
                            day.date);
                }
                return extend({
                    name: projInfo[0].trim()
                }, setsAndReps);
            }
        });
        return items;
    }
}


function stat(scanResult) {
    var result = scanResult.days.reduce(function (result, day) {
        var sportTypeTime = result.sportTypeTime,
            sportItemSum = result.sportItemSum;
        result.count += day.count;
        result.time += day.time;

        day.sportLogs.forEach(function (log) {
            //根据运动种类进行time group
            groupTimeBySportType(log);
            //根据运动项目进行time group
            sumSportItem(log.items);
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


        function sumSportItem(sportItems) {
            sportItems.forEach(function (item) {
                var counter = sportItemSum[item.name];
                if (counter) {
                    counter.reps += item.reps * item.sets;
                    counter.sets += item.sets;
                } else {
                    sportItemSum[item.name] = counter = {};
                    counter.reps = item.reps * item.sets;
                    counter.sets = item.sets;
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
