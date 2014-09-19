
'use strict';

var notifier = require('../notifier');
var moment = require('moment');
var util = require('../util');
var drinkWaterConfig = require('../conf/config.json').watcher.drinkWater;

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
        notifier.notify({
            title: '喝杯水休息一下',
            subTitle: that.drankCups + ' / ' + that.cups
        });

    }, this.interval);
};

    /**
     * get drunk information of a specific date range
     * information contain cups
     */
DrinkWaterWatcher.prototype.getDrankInfoFromLog= function (from, to) {
    var fileData = util.readFileSync(drinkWaterConfig.logPath);
    var lines = fileData.split('\n');
    var sum = 0;
    lines.forEach(function (line) {
        var logInfoArr = line.split(',');
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
