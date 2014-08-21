/**
 * 输出月份日志
 */
'use strict';

var display = require('../dislpay_data');


exports.dispose = function (statResult) {
    outputSleepPeriod(statResult.sleepPeriodArr);
    outputTimeGroupByTag(statResult.tagTime);
    outputTimeGroupByClass(statResult.classTime);
    outputSumTime(statResult.sumTime);
    outputTimeGroupByProject(statResult.projectTime);
    outputUnTrackedTime(statResult.unTrackedTime);
};


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
