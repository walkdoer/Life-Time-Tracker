'use strict';
//dependencies
var util = require('./util'),
    msg = require('./message'),
    moment = require('moment'),
    logClassEnum = require('./enum/logClass'),
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
var userArguments = argv.slice(3);
userArguments.forEach(function (val, index) {
    userOptions.showOriginLogs = ['--origin', '-o'].indexOf(val) >= 0;
    userOptions.updateDatabase = ['--updateDb', '-udb'].indexOf(val) >= 0;
    if (['--sport', '-spr'].indexOf(val) >= 0) {
        userOptions.logClass = logClassEnum.Sport;
    } else if (['--think', '-tk'].indexOf(val) >= 0) {
        userOptions.logClass = logClassEnum.Think;
    } else if (['--break', '-brk'].indexOf(val) >= 0) {
        userOptions.logClass = logClassEnum.Break;
    } else if (['--perspective', '-p'].indexOf(val) >= 0) {
        var perspective = userArguments[index + 1];
        if (!perspective) {
            msg.error('should have a perspective.');
            process.exit(1);
        }
        userOptions.perspective = perspective;
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


    var options = extend({}, userOptions, {
        dateType: dateType,
        dateStr: dateStr,
        dateArr: dateArr
    });
    var statist = getStatist(dateType, options);

    /**
     * the statist is used to stat the log data the then scanner have scan
     *
     * process step
     *     1. scan
     *     2. stat
     *     3. output
     */
    scanner.scan(options)
           .then(statist.dispose.bind(statist, options))
           .then(outputor.dispose.bind(outputor, options));
}

function getStatist(type) {
    var statistPath = './statists/' + type ;
    return require(statistPath);
}


function standardizeDate(dateStr) {
    var length = dateStr.split('-').length;
    var dateFormat = ['YYYY', 'YYYY-MM', 'YYYY-MM-DD'][length - 1];
    var tmpMoment = new moment(dateStr, dateFormat);
    return tmpMoment.format(dateFormat);
}
