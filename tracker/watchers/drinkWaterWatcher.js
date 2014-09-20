
'use strict';

var notifier = require('../notifier');
var moment = require('moment');
var util = require('../util');
var drinkWaterConfig = require('../conf/config.json').watcher.drinkWater;
var Message = require('../message');

var DrinkWaterWatcher = function (options) {
    //how many cups of water that should drink one day.
    this.cups = options.cups;
    //remind interval the unit is milliseconds
    this.interval = options.interval;
};


DrinkWaterWatcher.prototype.watch = function () {
    var that = this;
    //get today's drinkInfo
    var drankInfo = this.getDrankInfoFromLog(Date.now());
    this.drankCups = drankInfo.cups;
    setInterval(function () {
        //pass midnight then read the new day's drinkInfo
        if (moment().hour() === 0) {
            drankInfo = that.getDrankInfoFromLog(Date.now());
            that.drankCups = drankInfo.cups;
        }
        var subTitle = '已喝:' + that.drankCups + '杯, 剩下' + that.cups + '杯';
        notifier.notify({
            title: '喝杯水休息一下',
            subTitle:subTitle,
            content: getEncourageMsg(that.drankCups, that.cups),
            execute: 'ltt action drink'
        });

    }, this.interval || drinkWaterConfig.interval);
};

function getEncourageMsg(achieve, goal) {
    var msg;
    var progress = achieve / goal;
    if (progress <= 0.3) {
        msg = '来,加把劲,赶上目标';
    } else if(progress <= 0.5) {
        msg = '做得不错，加油';
    } else if(progress <= 0.7) {
        msg = '好样的,剩下不多了';
    } else if(progress <= 0.9) {
        msg = '很好，快达到目标了';
    } else {
        msg = 'progress:' + (progress * 100).toFixed(2) + '%';
    }
    return msg;
}

/**
 * get drunk information of a specific date range
 * information contain cups
 */
DrinkWaterWatcher.prototype.getDrankInfoFromLog= function (from, to) {
    var fileData = util.readFileSync(drinkWaterConfig.logPath);
    var lines = fileData.split('\n').filter(function (line) {
        return line.trim().length > 0;
    });
    var sum = 0;
    lines.forEach(function (line) {
        var logInfoArr = line.split(',');
        if (logInfoArr.length < 2) {
            Message.error('喝水日志格式"' + line + '"不准确');
        }
        var date = logInfoArr[0],
            cups = parseInt(logInfoArr[1], 10);

        var fromMoment = new moment(from).startOf('day'),
            toMoment = new moment(from || to).endOf('day'),
            drankMoment = new moment(date);

        //if drankTime is between from and to
        if (!(moment.min(fromMoment, drankMoment) === drankMoment ||
            moment.max(toMoment, drankMoment) === drankMoment)) {
            sum += cups;
        }
    });

    return {
        cups: sum
    };
};

module.exports = DrinkWaterWatcher;
