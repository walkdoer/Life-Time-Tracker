
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
    var logData = result.data;
    var logs = helper.getLogs(logData);
    var tags = helper.getTags(logData);
    msg.info(getBasicInfo({
        date: result.date,
        tagNum: tags.length,
        logNum: logs.length
    }));
}

function getBasicInfo(data) {

    return data.date + ' have ' + data.logNum + ' logs and ' + data.tagNum + ' tags;';
}

function handleError(err) {
    if (err.code === 'ENOENT') {
        msg.error('can\' find log file ' + err.path +
                ', please check the existence of the file');
    } else {
        msg.error(err.message);
    }
}
