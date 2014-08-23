/**
 * 输出月份日志
 */
'use strict';

var display = require('../dislpay_data');
var moment = require('moment');


exports.dispose = function (statResult, options) {
    outputOverivew(statResult, options);
    outputSleepPeriod(statResult.sleepPeriodArr);
    console.log('平均睡眠时长:' + (statResult.meanSleepTime / 60).toFixed(2));
    outputTimeGroupByTag(statResult.tagTime);
    outputTimeGroupByClass(statResult.classTime);
    outputSumTime(statResult.sumTime);
    outputTimeGroupByProject(statResult.projectTime);
    outputUnTrackedTime(statResult.unTrackedTime);
};

function outputOverivew(statResult, options) {
    var unTrackedDays = statResult.unTrackedDays;
    console.log("======= " + options.dateStr + "的概括 ========");
    console.log("一共记录了" + statResult.days.length + '天' +
            '但是有' + unTrackedDays.length + '天没有记录, 分别是:\n' +
        '\t' + unTrackedDays.join(', '));
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
                aZero = new moment(a.date + ' 00:00').add(1, 'day'),
                bZero = new moment(b.date + ' 00:00').add(1, 'day');
            var aSpan = aZero.diff(aTime, 'minute');
            var bSpan = bZero.diff(bTime, 'minute');
            if (order === 'desc') {
                return aSpan - bSpan;
            } else {
                return bSpan - aSpan;
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


function outputTimeGroupByProject (datas) {
    outputGroup('Project');
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
    console.log('\n========= 未记录时间 =========\n');
    display.bar(data);
}
