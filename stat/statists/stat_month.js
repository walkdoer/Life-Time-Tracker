'use strict';

var msg = require('../message');
var when = require('when');
var moment = require('moment');
var helper = require('./helper');
var statDay = require('./stat_day');

exports.stat = function (dateArr) {
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
};

function getDayNumInMonth (year, month) {
    return new Date(year, month, 0).getDate();
}


function analyse(datas, year, month) {
    var sleepTimeArr = [];
    datas.forEach(function (d, index) {
        var day = index + 1,
            date = [year, month, day].join('-');
        if (d.state === 'rejected') {
            msg.warn(date + ' calculate fail');
        } else if (d.state === 'fulfilled'){
            var dayData = d.value;
            recordSleepTime(date, dayData.sleepTime);
        }
    });
    function recordSleepTime(date, sleepTime) {
        sleepTimeArr.push({
            date: date,
            time: new moment(sleepTime)
        });
    }

    return {
        sleepTimeArr : sleepTimeArr
    };
}





function output(result) {
    outputSleepPeriod(result.sleepTimeArr);
    outputTimeGroupByTag(result);
    outputTimeGroupByClass(result);
}


function outputSleepPeriod(sleepTimeArr) {

    console.log("======== Sleep Period========");
    sleepTimeArr.sort(function (a, b) {
        var aTime = a.time,
            bTime = b.time,
            aHour = aTime.hour(),
            aMins = aTime.minute(),
            bHour = bTime.hour(),
            bMins = bTime.minute();
        aHour = aHour === 0 ? 24 : aHour;
        bHour = bHour === 0 ? 24 : bHour;
        var hourSpan = aHour-bHour,
            minSpan = aMins - bMins;
        if (hourSpan === 0) {
            return minSpan;
        } else {
            return hourSpan;
        }
    }).forEach(function (d) {
        var str = d.date.split('-')[2] + '号睡觉时间：' + d.time.format('HH:mm').magenta;
        console.log(str);
    });
}

function outputTimeGroupByTag () {

}


function outputTimeGroupByClass() {

}
