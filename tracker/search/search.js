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
var _ = require('lodash');
var extend = require('extend');

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
    var otherCondition = getOtherCondition(options);
    extend(queryCondition, otherCondition);
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

function getOtherCondition(options) {
    var condition = {};
    var projects = options.projects;
    if (!_.isEmpty(projects)) {
        if (projects.length === 1) {
            condition.projects = {
                $elemMatch: {name: options.projects[0]}
            };
        } else {
            condition.projects = {
                $elemMatch: {name: {$in: options.projects}}
            };
        }
    }
    return condition;
}
