/**
 * life scanner
 *
 * scan all the logs from the log file, and transform into Log Object
 * including all the aspect of life, work,study,think,break,sport
 */

'use strict';

var dateTypeEnum = require('../enum/dateType'),
    util = require('../util'),
    msg = require('../message'),
    helper = require('../helper'),
    when = require('when');

exports.scan = function (options) {
    var deferred = when.defer();
    readLogFile(options)
        .then(preprocessFileData)
        .then(extractLogs)
        .then(function (scanResult) {
            scanResult.options = options;
            deferred.resolve(scanResult);
        })
        .catch(function (err) {
            msg.error(err);
            deferred.reject(err);
            //after stable delete this throw err code
            if (err) {
                throw err;
            }
        });
    return deferred.promise;
};


function readLogFile(options) {
    var dateType = options.dateType,
        dateArr = options.dateArr,
        year = dateArr[0],
        month = dateArr[1],
        day = dateArr[2];
    if (dateType === dateTypeEnum.Day) {
        return readOneDayLog(year, month, day);
    } else if (dateType === dateTypeEnum.Month){
        return readOneMonthLog(year, month);
    }
}


/**
 * read only the log of one specific day
 */
function readOneDayLog(year, month, day) {
    return util.readLogFiles([year, month, day].join('-'));
}



/**
 * read only the log of one specific month
 *
 */
function readOneMonthLog(year, month) {
    //the day number of month
    var dayNum = util.getDayNumInMonth(year, month);
    var day = 1;
    var queue = [];
    while (day <= dayNum) {
        queue.push(readOneDayLog(year, month, day));
        day++;
    }
    //use when.settle: because some file may not exist
    //so when.all is not appropriate
    return when.settle(queue);
}

function preprocessFileData(fileData) {
    return fileData;
}


function extractLogs(fileData) {
    var date = fileData.date,
        fileContent = fileData.fileContent;
    fileData.logs = helper.getLogs(fileContent, date);
    return fileData;
}
