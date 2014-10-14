/**
 * search logs
 *
 */

'use strict';


var Q = require('q');
var Log = require('../model/log');
var TimeFormat = require('../timeFormat');
var dateTypeEnum = require('../enum/dateType');
var Moment = require('moment');

exports.query = function(options) {
    var deferred = Q.defer();
    queryLog(options, function(result) {
        deferred.resolve(result.map(function(item) {
            return item.toJSON();
        }));
    }, function(err) {
        deferred.reject(err);
    });
    return deferred.promise;
};


function queryLog(options, onSuccess, onError) {
    var condition = createQueryCondition(options);
    var args = [condition, function(err, result) {
        if (err) {
            onError(err);
        } else {
            onSuccess(result);
        }
    }].filter(function (val) { return !!val;});
    Log.find.apply(Log, args);
}


function createQueryCondition(options) {
    var queryCondition = {};
    var dateCondition = getDateCondition(options);
    if (dateCondition) {
        queryCondition.date = dateCondition;
    }
    return queryCondition;
}

function getDateCondition(options) {
    var condition,
        zero = ' 00:00:00',
        date = options.dateItems[0];
    if (date) {
        if (date.type === dateTypeEnum.Day) {
            condition = new Date(date.value + zero);
        } else if (date.type === dateTypeEnum.Month) {
            var m = new Moment(date.value);
            var startDate = m.startOf('month').format(TimeFormat.date),
                endDate = m.endOf('month').format(TimeFormat.date);
            condition = {
                $gte: new Date(startDate + zero),
                $lt: new Date(endDate + zero)
            };
        }
    }

    return condition;
}
