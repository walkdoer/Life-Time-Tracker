/**
 * 健身日志分析
 *
 */

'use strict';


function dispose (datas) {
    var result = datas.reduce(function (result, data) {
        var sportItemTime = result.sportItemTime;
        result.count += data.count;
        result.time += data.time;

        data.logs.forEach(function (log) {
            log.type.forEach(function (type) {
                var item = getSportItemTimeByType(type);
                if (item) {
                    item.count += log.time;
                } else {
                    sportItemTime.push({
                        type: type,
                        count: log.time
                    });
                }
            });
        });
        function getSportItemTimeByType(type) {
            return sportItemTime.filter(function (timeItem) {
                return timeItem.type.en === type.en;
            })[0] || null;
        }
        return result;
    }, {
        count: 0,
        time: 0,
        sportItemTime: []
    });

    return result;
}



exports.dispose = dispose;
