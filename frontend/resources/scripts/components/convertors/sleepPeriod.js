define(function (require, exports) {
    'use strict';
    var moment = require('moment');
    exports.dispose = function (rawData) {
        var wakeLine = {
            name: 'wake',
            data: []
        };
        var sleepLine = {
            name: 'sleep',
            data: []
        };
        var sleepTime = {
            name: '睡眠长度',
            type: 'column',
            color: 'rgba(165,170,217,0.5)',
            yAxis: 1,
            tooltip: {
                valueSuffix: 'hours',
                pointFormat: '<span style="color:{series.color}">\u25CF</span> {series.name}: <b>{point.y:.1f}</b><br/>'
            },
            data: []
        };
        var wakeData = wakeLine.data;
        var sleepData = sleepLine.data;
        var sleepTimeData = sleepTime.data;
        var midnight = moment().startOf('day').unix() * 1000;
        rawData.forEach(function(day) {
            var dateTS = moment(day.date).unix() * 1000;
            var wakeMoment = new moment(day.wakeMoment);
            var sleepMoment = new moment(day.sleepMoment);
            console.log(day.date, sleepMoment.hours(), sleepMoment.minutes());
            wakeData.push([dateTS, getYAxisValue(wakeMoment)]);
            sleepData.push([dateTS, getYAxisValue(sleepMoment)]);
            sleepTimeData.push([dateTS, day.sleepTime / 60]);


            function getYAxisValue(m) {
                var hours = m.hours();
                if (hours >= 0 && hours <= 12) {
                    //next midnight
                    return midnight + m.hours() * 3600000 + m.minutes() * 60000 + 3600000 * 24;
                } else {
                    return midnight + m.hours() * 3600000 + m.minutes() * 60000;
                }
            }
        });
        return {
            series: [wakeLine, sleepLine, sleepTime]
        };
    };
});
