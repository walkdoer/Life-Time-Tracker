#!/usr/bin/env node
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
    //calendar
    calendar = require('./calendar'),
    db = require('./model/db');
//get the date that want to stat, it can be year or month or day

var program = require('commander');

program
    .version('0.1.0')
    .option('-ol, --originLogs', 'show origin logs')
    .option('-p, --perspective <s>', 'choose an perspective')
    .option('-f, --filter <s>', 'use to filter logs')
    .option('-c, --calandar <date>', 'see activity calandar');

program
    .command('stat <date>')
    .description('对所选日期进行统计')
    .action(dispatch);

program.parse(process.argv);




function dispatch(dateStr) {
    if (!dateStr) {
        return msg.error('should have a date arguments.');
    }
    var date = new Date(dateStr);
    if (!util.isValidDate(date)) {
        return msg.error('the date is not right!');
    }
    //standardlize the date 2014-08-01 to 2014-8-1
    dateStr = standardizeDate(dateStr);
    db.connect();
    var dateArr = dateStr.split('-').map(function (val){
        return parseInt(val, 10);
    });
    var dateType = [null, 'year', 'month', 'day'][dateArr.length],
        userOptions = getUserOptions();
    var options = extend({}, userOptions, {
        dateType: dateType,
        dateStr: dateStr,
        dateArr: dateArr
    });

    //get activity calendar,like sport calendar, or read calendar etc.
    if (options.calendar) {
        calendar.generate(options);
        return;
    }


    //get the corresponding statist of specific type, type can be `day` and `month` for now
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

function getUserOptions() {
    var userOptions = {};
    if (program.perspective) {
        userOptions.perspective = program.perspective;
        msg.info('set perspective: ' + program.perspective);
    }
    if (program.filter) {
        userOptions.filter = program.filter;
        msg.info('set filter: ' + program.perspective);
    }
    if (program.calandar) {
        userOptions.calandar = program.calandar;
        msg.info('set calandar: ' + program.calandar);
    }
    return userOptions;
}


function standardizeDate(dateStr) {
    var length = dateStr.split('-').length;
    var dateFormat = ['YYYY', 'YYYY-MM', 'YYYY-MM-DD'][length - 1];
    var tmpMoment = new moment(dateStr, dateFormat);
    return tmpMoment.format(dateFormat);
}
