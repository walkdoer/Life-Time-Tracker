'use strict';

var util = require('../util');
var msg = require('../message');
var helper = require('./helper');
var statDay = require('./stat_day');

exports.stat = function (dateArr) {
    var year = parseInt(dateArr[0]);
    var month = parseInt(dateArr[1]);
    //the day number of one month
    var dayNum = getDayNumInMonth(year, month);
    var day = 1;
    
    while (day <= dayNum) {
        statDay.stat(year, month, day)
        day++;
    }
};

function getDayNumInMonth (year, month) {
    return new Date(year, month, 0).getDate();
}

function analyse(result) {
    var logs = helper.getLogs(result.data);
    msg.info(result.date + ' have ' + logs.length + 'logs;');
}

function handleError(err) {
    if (err.code === 'ENOENT') {
        msg.error('can\' find log file ' + err.path +
                ', please check the existence of the file');
    } else {
        msg.error(err.message);
    }
}
