'use strict';
var moment = require('moment');
function dispose(datas) {
    var sleepPeriodArr = [],
        unTrackedTime = [];

    /**
     * record sleep period
     */
    datas.forEach(function (d) {
        recordSleepPeriod(d);
        recordUnTrackedTime(d);
    });


    function recordSleepPeriod(data) {
        sleepPeriodArr.push({
            date: data.date,
            sleepMoment: new moment(data.sleepMoment),
            wakeMoment: new moment(data.wakeMoment),
            sleepTime: data.sleepTime
        });
    }

    function recordUnTrackedTime(day) {
        unTrackedTime.push({
            label: day.date,
            count: day.unTrackedTime
        });
    }

    //filter the datas only left the fulfilled;
    var days = datas.filter(function (d) {
        return d.state === 'fulfilled';
    }).map(function (d) {
        return d.value;
    });

    return {
        sleepPeriodArr: sleepPeriodArr,
        classTime: groupTimeByClass(days),
        tagTime: groupTimeByTag(days),
        projectTime: groupTimeBy('project', days),
        unTrackedTime: unTrackedTime,
        sumTime: sumTime(days)
    };
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
