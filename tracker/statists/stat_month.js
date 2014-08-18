'use strict';

var msg = require('../message');
var when = require('when');
var moment = require('moment');
var statDay = require('./stat_day');
var display = require('../dislpay_data');

exports.dispose = function (config) {
    stat(config.dateArr);
};

function stat(dateArr) {
    var year = parseInt(dateArr[0]);
    var month = parseInt(dateArr[1]);
    //the day number of one month
    var dayNum = getDayNumInMonth(year, month);
    var day = 1;
    var queue = [];
    while (day <= dayNum) {
        queue.push(statDay.calculate([year, month, day]));
        day++;
    }
    when.settle(queue).then(function (datas) {
        var result = analyse(datas, year, month);
        output(result);
    });
}

function getDayNumInMonth (year, month) {
    return new Date(year, month, 0).getDate();
}


function analyse(datas, year, month) {
    var sleepPeriodArr = [],
        unTrackedTime = [];

    /**
     * record sleep period
     */
    datas.forEach(function (d, index) {
        var day = index + 1,
            date = [year, month, day].join('-');
        if (d.state === 'rejected') {
            msg.warn(date + ' calculate fail');
        } else if (d.state === 'fulfilled'){
            var dayData = d.value;
            recordSleepPeriod(dayData);
            recordUnTrackedTime(dayData);
        }
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
        unTrackedTime: unTrackedTime,
        sumTime: sumTime(days)
    };
}


function output(result) {
    outputSleepPeriod(result.sleepPeriodArr);
    outputTimeGroupByTag(result.tagTime);
    outputTimeGroupByClass(result.classTime);
    outputSumTime(result.sumTime);
    outputUnTrackedTime(result.unTrackedTime);
}


function outputSleepPeriod(sleepPeriodArr) {

    var dateFormat = 'HH:mm';
    console.log("======== 睡眠周期 (起床) - (睡觉) = (睡眠时长) ========");
    sleepPeriodArr.forEach(outputSleepMoment);

    var lastSleep = sleepPeriodArr.sort(sortBy('sleepMoment', 'desc'))[0];
    var firstWake = sleepPeriodArr.sort(sortBy('wakeMoment', 'asc'))[0];

    console.log(('这个月' + lastSleep.date.split('-')[2] + '号最晚睡觉').blue);
    console.log(('这个月' + firstWake.date.split('-')[2] + '号最早起').blue);

    function sortBy(time, order) {
        return function (a, b) {
            var aTime = a[time],
                bTime = b[time],
                aHour = aTime.hour(),
                aMins = aTime.minute(),
                bHour = bTime.hour(),
                bMins = bTime.minute();
            aHour = aHour === 0 ? 24 : aHour;
            bHour = bHour === 0 ? 24 : bHour;
            var hourSpan, minSpan;

            if (order === 'desc') {
                hourSpan = bHour - aHour;
                minSpan = bMins - aMins;
            } else {
                hourSpan = aHour-bHour;
                minSpan = aMins - bMins;
            }
            if (hourSpan === 0) {
                return minSpan;
            } else {
                return hourSpan;
            }
        };
    }

    function outputSleepMoment (d) {
        var str = d.date.split('-')[2] + '号: ' +
                d.wakeMoment.format(dateFormat).blue + ' - ' +
                d.sleepMoment.format(dateFormat).magenta + ' = '+ 
                ((d.sleepTime / 60).toFixed(2) + 'h').yellow;
        console.log(str);
    }
}

function outputTimeGroupByTag (datas) {
    outputGroup('Tag');
    display.bar(datas);
}



function outputTimeGroupByClass(datas) {
    outputGroup('Class');
    display.bar(datas);
}


function outputSumTime(sumtime) {
    outputGroup('Time Type');
    display.bar(sumtime);
}


function outputGroup (groupName) {
    console.log('\n========= Group Time By ' + groupName + ' =======\n');
}


function outputUnTrackedTime(data) {
    outputGroup('未记录时间');
    display.bar(data);
}

function groupTimeByTag(days) {
    var result = [];
    days.forEach(function (d) {
        var tagTime = d.tagTime;
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
