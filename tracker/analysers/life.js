'use strict';
var moment = require('moment');
function dispose(days) {
    var sleepPeriodArr = [],
        unTrackedTime = [];

    /**
     * record sleep period
     */
    days.forEach(function (d) {
        recordSleepPeriod(d);
        recordUnTrackedTime(d);
    });


    /**
     * 记录睡眠周期
     *
     */
    function recordSleepPeriod(data) {
        sleepPeriodArr.push({
            date: data.date,
            sleepMoment: new moment(data.sleepMoment),
            wakeMoment: new moment(data.wakeMoment),
            sleepTime: data.sleepTime
        });
    }

    /**
     * 记录每一天没有跟踪到的时间
     */
    function recordUnTrackedTime(day) {
        unTrackedTime.push({
            label: day.date,
            count: day.unTrackedTime
        });
    }

    return {
        sleepPeriodArr: sleepPeriodArr,
        classTime: groupTimeByClass(days).sort(desc),
        tagTime: groupTimeByTag(days).sort(desc),
        projectTime: groupTimeBy('project', days).sort(desc),
        unTrackedTime: unTrackedTime,
        sumTime: sumTime(days)
    };

    function desc(a, b) {
        return b.count - a.count;
    }
}

function groupTimeByTag(days) {
    return groupTimeBy('tag', days);
}

function groupTimeBy(type, days) {
    var result = [];
    days.forEach(function (d) {
        var tagTime = d[type + 'Time'];
        tagTime.forEach(function (t) {
            var target = getTarget(t.label);

            if (target) {
                target.count += t.count;
            } else {
                result.push(t);
            }
        });
    });

    function getTarget(label) {
        var target = result.filter(function (itm) {
            return itm.label === label;
        });

        return target[0] || null;
    }

    return result;
}

function groupTimeByClass(days) {
    var result = [];
    days.forEach(function (d) {
        var classTime = d.classTime;
        classTime.forEach(function (t) {
            var target = getTarget(t.label);

            if (target) {
                target.count += t.count;
            } else {
                result.push(t);
            }
        });
    });

    function getTarget(label) {
        var target = result.filter(function (itm) {
            return itm.label === label;
        });

        return target[0] || null;
    }

    return result;
}


function sumTime(days) {
    var sum = days.reduce(function (sum, d) {
        sum.trackedTime += d.trackedTime;
        sum.sleepTime += d.sleepTime;
        sum.activeTime += d.activeTime;
        return sum;
    }, {
        sleepTime: 0,
        trackedTime: 0,
        activeTime: 0
    });
    return sum;
}

exports.dispose = dispose;
