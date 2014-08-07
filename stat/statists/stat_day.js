
'use strict';

var util = require('../util');
var msg = require('../message');
var helper = require('./helper');

exports.stat = function (dateArr) {
    var year = parseInt(dateArr[0]);
    var month = parseInt(dateArr[1]);
    var day = parseInt(dateArr[2]);
    if (!util.isDayValid(year, month, day)) {
        throw new Error('day ' + day + ' is out of the day range of month ' + month);
    }
    util.readLogFiles(year, month, day)
        .then(analyse)
        .catch(handleError);
};


function analyse(result) {
    var date = result.date;
    var logData = result.data;
    var logs = helper.getLogs(logData);
    var classes = helper.getClasses(logData);
    var tags = helper.getTags(logData);
    msg.info(getBasicInfo({
        date: date,
        tagNum: tags.length,
        logNum: logs.length
    }));
    msg.log('tags:'.bold + tags.join(', ').italic.blue);
    msg.log('classes:'.bold + classes.join(', ').magenta);

    //calculate total time
    var totalMins = 0;
    logs.forEach(function (log, index) {
        var logInfo = helper.getLogInfo(log, date, index);
        if (logInfo) {
            if (isGetUpLog(logInfo)) {
                msg.info('Get Up Time: ' + logInfo.start);
            }
            if (logInfo.len !== undefined) {
                totalMins += logInfo.len;
            } else if(!logInfo.start){
                msg.warn('May be there\' something wrong with you time format of this log: ' +
                    log);
            }
        }
    });
    var totalHours = totalMins / 60;

    msg.log('total time: ' + totalMins.toString().cyan + ' minutes; ' + totalHours.toFixed(2).cyan + ' hours.');
}

function getBasicInfo(data) {
    return data.date + ' have ' + data.logNum + ' logs and ' + data.tagNum + ' tags;';
}

function isGetUpLog(log) {
    return log.start && !log.end && log.index === 0;
}

function handleError(err) {
    if (err.code === 'ENOENT') {
        msg.error('can\' find log file ' + err.path +
                ', please check the existence of the file');
    } else {
        msg.error(err.message);
        throw err;
    }
}
