'use strict';

var util = require('../util');
var msg = require('../message');
exports.stat = function (dateArr) {
    var year = parseInt(dateArr[0]);
    var month = parseInt(dateArr[1]);
    //the day number of one month
    var dayNum = getDayNumInMonth(year, month);
    var day = 1, fileName;
    while (day <= dayNum) {
        fileName = [year, month, day].join('/') + '.md';
        util.readLogFiles(fileName)
            .then(analyse)
            .catch(handleError);
        day++;
    }
};

function getDayNumInMonth (year, month) {
    return new Date(year, month, 0).getDate();
}

function analyse(data) {
    msg.info('the file data is');
    msg.info(data);
}

function handleError(err) {
    if (err.code === 'ENOENT') {
        msg.error('can\' find log file ' + err.path +
                ', please check the existence of the file');
    } else {
        msg.error(err.message);
    }
}
