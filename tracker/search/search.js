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
    var args = [condition,
        function(err, result) {
            if (err) {
                onError(err);
            } else {
                onSuccess(result);
            }
        }
    ].filter(function(val) {
        return !!val;
    });
    Log.find.apply(Log, args);
}


function createQueryCondition(options) {
    var $and = [];
    var dateCondition = getDateCondition(options);
    if (dateCondition) {
        $and.push(dateCondition);
    }
    var filters = getFilters(options);
    if (!_.isEmpty(filters)) {
        $and = $and.concat(filters);
    }
    return {
        $and: $and
    };
}


function getDateCondition(options) {
    var condition,
        zero = ' 00:00:00',
        date = options.dateItems[0];
    if (date) {
        if (date.type === dateTypeEnum.Day) {
            condition = new Date(date.value + zero);
        } else if (date.type === dateTypeEnum.Month) {
            condition = to$Operator(date, 'month');
        } else if (date.type === dateTypeEnum.Year) {
            condition = to$Operator(date, 'year');
        }
    }

    function to$Operator(date, dateType) {
        var m = new Moment(date.value);
        var startDate = m.startOf(dateType).format(TimeFormat.date),
            endDate = m.endOf(dateType).format(TimeFormat.date);
        return  {
            $gte: new Date(startDate + zero),
            $lt: new Date(endDate + zero)
        };
    }
    return {date: condition};
}




function getFilters(options) {
    var filters = [];
    var projects = options.projects,
        tags = options.tags;
    if (!_.isEmpty(projects)) {
        if (projects.length === 1) {
            filters.push({
                projects: {
                    $elemMatch: {
                        name: options.projects[0]
                    }
                }
            });
        } else {
            filters.push({
                projects: {
                    $elemMatch: {
                        name: {
                            $in: options.projects
                        }
                    }
                }
            });
        }
    }

    if (!_.isEmpty(tags)) {
        if (tags.length === 1) {
            filters.push({
                tags: tags[0]
            });
        } else {
            filters.push({
                tags: { $in: tags }
            });
        }
    }
    return filters;
}
