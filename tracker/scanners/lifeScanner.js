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
        .then(preprocessFileData.bind(null, options))
        .then(extractLogs.bind(null, options))
        .then(function (scanResult) {
            if (options.dateType === dateTypeEnum.Month) {
                scanResult = {
                    days: scanResult
                };
            }
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

function preprocessFileData(options, fileData) {
    var dateStr = options.dateStr;
    if (options.dateType === dateTypeEnum.Month) {
        fileData = fileData.filter(function (d, index) {
            var day = index + 1,
                date = [dateStr, day].join('-');
            if (d.state === 'rejected') {
                msg.warn(date + ' calculate fail');
                return false;
            } else if (d.state === 'fulfilled'){
                return true;
            }
        }).map(function (d) {
            return d.value;
        });
    }
    return fileData;
}


function extractLogs(options, fileData) {
    var date = fileData.date,
        fileContent = fileData.fileContent;

    if (options.dateType === dateTypeEnum.Month) {
        fileData.forEach(function (file) {
            file.logs = helper.getLogs(file.fileContent, file.date);
        });
    } else if (options.dateType === dateTypeEnum.Day) {
        fileData.logs = helper.getLogs(fileContent, date);
    }
    return fileData;
}
