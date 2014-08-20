/**
 * 健身日志分析
 *
 */

'use strict';


function dispose (datas) {
    var result = datas.reduce(function (result, data) {
        var sportTypeTime = result.sportTypeTime,
            sportItemSum = result.sportItemSum;
        result.count += data.count;
        result.time += data.time;

        data.logs.forEach(function (log) {
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



exports.dispose = dispose;
