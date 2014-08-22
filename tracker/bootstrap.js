'use strict';
//dependencies
var util = require('./util'),
    msg = require('./message'),
    moment = require('moment'),
    extend = require('node.extend'),
    //normal life scanner
    scanner = require('./scanner'),
    //output the stat result
    outputor = require('./outputor'),
    db = require('./model/db');

//get the date that want to stat, it can be year or month or day
var argv = process.argv;
var dateStr = argv[2];

var userOptions = {};
argv.slice(3).forEach(function (val) {
    userOptions.showOriginLogs = ['--origin', '-o'].indexOf(val) >= 0;
    userOptions.updateDatabase = ['--updateDb', '-udb'].indexOf(val) >= 0;
    if (['--sport', '-spr'].indexOf(val) >= 0) {
        userOptions.logClass = 'SPR';
    } else if (['--think', '-tk'].indexOf(val) >= 0) {
        userOptions.logClass = 'TK';
    } else if (['--break', '-brk'].indexOf(val) >= 0) {
        userOptions.logClass = 'BRK';
    }
});

if (!dateStr) {
    return msg.error('should have a date arguments.');
}

//standardlize the date 2014-08-01 to 2014-8-1
dateStr = standardizeDate(dateStr);
var date = new Date(dateStr);
if (!util.isValidDate(date)) {
    return msg.error('the date is not right!');
}

db.connect()
    .then(function() {
        dispatch(dateStr);
    })
    .catch(function () {
        msg.warn('数据库连接失败，统计结果将无法保存');
        dispatch(dateStr);
    });



function dispatch(dateStr) {
    var dateArr = dateStr.split('-').map(function (val){
        return parseInt(val, 10);
    });
    var dateType = [null, 'year', 'month', 'day'][dateArr.length];
    //the statist is used to stat the log data the then scanner have scan;
    var statist = getStatist(dateType, userOptions);


    var options = extend({}, userOptions, {
        dateType: dateType,
        dateStr: dateStr,
        dateArr: dateArr
    });

    /**
     * process step:
     *     1. scan
     *     2. stat
     *     3. output
     */
    scanner.scan(options)
           .then(statist.dispose.bind(statist))
           .then(outputor.dispose.bind(outputor));
}

function getStatist(type, userOptions) {
    var statistPath = './statists/',
        statistsMap = {
            SPR: 'sport'
        },
        logClass = userOptions.logClass;
    statistPath += statistsMap[logClass] || type;
    return require(statistPath);
}


function standardizeDate(dateStr) {
    var length = dateStr.split('-').length;
    var dateFormat = ['YYYY', 'YYYY-MM', 'YYYY-MM-DD'][length - 1];
    var tmpMoment = new moment(dateStr, dateFormat);
    return tmpMoment.format(dateFormat);
}
