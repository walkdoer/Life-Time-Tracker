'use strict';
//dependencies
var util = require('./util'),
    msg = require('./message'),
    moment = require('moment'),
    extend = require('node.extend'),
    db = require('./model/db');

//get the date that want to stat, it can be year or month or day
var argv = process.argv;
var dateStr = argv[2];

var userOptions = {};
argv.slice(3).forEach(function (val) {
    userOptions.showOriginLogs = ['--origin', '-o'].indexOf(val) >= 0;
    userOptions.updateDatabase= ['--updateDb', '-udb'].indexOf(val) >= 0;
});

if (!dateStr) {
    return msg.error('should have a date arguments.');
}
//对日期进行标准化

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
    var type = [null, 'year', 'month', 'day'][dateArr.length];
    var statist = getStatist(type);
    var disposeCfg = extend({}, userOptions, {
        dateStr: dateStr,
        dateArr: dateArr
    });
    if (statist) {
        statist.dispose(disposeCfg);
    } else {
        msg.warn('找不到对应的统计程序');
    }
}

function getStatist(type) {
    return require('./statists/stat_' + type);
}

function standardizeDate(dateStr) {
    var length = dateStr.split('-').length;
    var dateFormat = ['YYYY', 'YYYY-MM', 'YYYY-MM-DD'][length - 1];
    var tmpMoment = new moment(dateStr, dateFormat);
    return tmpMoment.format(dateFormat);
}
