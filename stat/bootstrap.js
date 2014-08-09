'use strict';
//dependencies
var util = require('./util'),
    msg = require('./message');


//get the date that want to stat, it can be year or month or day
var argv = process.argv;
var dateStr = argv[2];
var showOriginLogs = ['-origin', '-o'].indexOf(argv[3]) >= 0;

if (!dateStr) {
    return msg.error('should have a date arguments.');
}

var date = new Date(dateStr);
if (!util.isValidDate(date)) {
    return msg.error('the date is not right!');
}

msg.success('compute success');

dispatch({
    dateStr: dateStr,
    showOriginLogs: showOriginLogs
});


function dispatch(config) {
    var dateArr = config.dateStr.split('-');
    var type = [null, 'year', 'month', 'day'][dateArr.length];
    var statist = getStatist(type);
    statist.stat(dateArr, config.showOriginLogs);
}

function getStatist(type) {
    return require('./statists/stat_' + type);
}

