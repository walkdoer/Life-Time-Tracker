/**
 * month statist
 *
 * provide a landscape view of life in a month
 * for example
 *    total sleep time
 *    total work time
 * group time consume in different dimensions;
 */

'use strict';

var moment = require('moment');
var extend = require('node.extend');
var dayStat = require('./day');
var util = require('../util');
var msg = require('../message');

exports.dispose = function(scanResult) {
    var days = scanResult.days,
        sleepPeriodArr = [],
        unTrackedTime = [];


    /**
     * record sleep period
     */
    days = days.map(function (d) {
        d = dayStat.dispose(d);
        recordSleepPeriod(d);
        recordUnTrackedTime(d);
        return d;
    });


    /**
     * 记录睡眠周期
     *
     */
    function recordSleepPeriod(data) {
        if (!data.sleepMoment) {
            msg.error(data.date + 'have no sleepTime');
        }
        if (!data.wakeMoment) {
            msg.error(data.date + 'have no wakeTime');
        }
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


    var meanSleepTime = util.mean(days.filter(function (d) {
        return d.sleepTime > 0;
    }), 'sleepTime');
    return {
        days: days,
        unTrackedDays: scanResult.unTrackedDays,
        sleepPeriodArr: sleepPeriodArr,
        //mean sleep time of a month
        meanSleepTime: meanSleepTime,
        classTime: groupTimeByClass(days).sort(desc),
        tagTime: groupTimeByTag(days).sort(desc),
        projectTime: groupTimeBy('project', days, function (t) {
            var label = t.label.split(':')[0];
            label = label.split(' ')[0];
            t.label = label;
            return t;
        }, function (item, target) {
            return target.indexOf(item.label) === 0;
        }).sort(desc),
        unTrackedTime: unTrackedTime,
        sumTime: sumTime(days)
    };

    function desc(a, b) {
        return b.count - a.count;
    }
};

function groupTimeByTag(days) {
    return groupTimeBy('tag', days);
}

function groupTimeBy(type, days, process, filter) {
    var result = [];
    days.forEach(function (d) {
        var tagTime = d[type + 'Time'];
        tagTime.forEach(function (t) {
            var target = getTarget(t.label);

            if (target) {
                target.count += t.count;
            } else {
                if(typeof process === 'function') {
                    t = process(extend({}, t));
                }
                result.push(t);
            }
        });
    });

    function getTarget(targetLabel) {
        var target = result.filter(function (itm) {
            if (filter) {
                return filter(itm, targetLabel);
            } else {
                return itm.label === targetLabel;
            }
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
