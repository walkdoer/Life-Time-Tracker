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
var Project = require('../model/project');
var Msg = require('../message');
var ObjectId = require('mongoose').Types.ObjectId;

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
    getQueryConditions(options)
        .then(function (conditions) {
            var queryOptions = getQueryOptions(options);
            var args = [
                conditions,
                options.fields || null,
                queryOptions
            ];
            Log.find.apply(Log, args)
                .populate({
                    path: 'project',
                })
                .exec(function(err, result) {
                    if (err) {
                        onError(err);
                    } else {
                        onSuccess(result);
                    }
                });
        });
}


function getQueryConditions(options) {
    var deferred = Q.defer();
    var $and = [];
    if (!_.isEmpty(options.projects)) {
        getProjectIds(options.projects, options.versions)
            .then(function (projectIdsCondition) {
                syncOptions();
                if (projectIdsCondition) {
                    $and.push(projectIdsCondition);
                }
                deferred.resolve({
                    $and: $and
                });
            });
    } else {
        syncOptions();
        deferred.resolve({$and: $and});
    }

    function syncOptions() {
        var dateCondition = getDateCondition(options);
        if (dateCondition) {
            $and.push(dateCondition);
        }
        var filters = getFilters(options);
        if (!_.isEmpty(filters)) {
            $and = $and.concat(filters);
        }
    }
    return deferred.promise;
}


function getQueryOptions(usrOptions) {
    var queryOptions = _.pick(usrOptions, ['limit', 'skip']);
    queryOptions.sort = {date: 1, start: 1};
    return queryOptions;
}


function getDateCondition(options) {
    var condition,
        date = options.dateItems[0];
    if (date) {
        if (date.type === dateTypeEnum.Day) {
            condition = new Date(date.value);
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
        return {
            $gte: new Date(startDate),
            $lt: new Date(endDate)
        };
    }

    return {
        date: condition
    };
}




function getFilters(options) {
    var filters = [],
        classes = options.classes,
        tags = options.tags;
    if (!_.isEmpty(classes)) {
        filters.push(getArrayOperator('classes', classes, 'code'));
    }

    if (!_.isEmpty(tags)) {
        if (tags.length === 1) {
            filters.push({
                tags: tags[0]
            });
        } else {
            filters.push({
                tags: {
                    $in: tags
                }
            });
        }
    }
    return filters;
}


function getArrayOperator(name, arr, identity) {
    var operator = {},
        $elemMatch = {};
    if (arr.length === 1) {
        $elemMatch[identity] = arr[0];
        operator[name] = {
            $elemMatch: $elemMatch
        };
    } else {
        $elemMatch[identity] = { $in: arr };
        operator[name] = {
            $elemMatch: $elemMatch
        };
    }
    return operator;
}

function getProjectIds(projects, versions) {
    var deferred = Q.defer();
    var condition = _CD(projects, 'name');
    if (!_.isEmpty(versions)) {
        _.extend(condition, _CD(versions, 'version'));
    }
    Project.find(condition, function (err, projects) {
        var idCondition;
        if (err) {
            Msg.error('Error occur when search with projects' + JSON.stringify(condition), err);
            deferred.reject(err);
        }
        var projectIds = null;
        if (projects) {
            projectIds = projects.map(function (project) {
                return new ObjectId(project.id);
            });
            idCondition = _CD(projectIds, 'project');
        } else {
            idCondition = null;
        }

        deferred.resolve(idCondition);
    });
    return deferred.promise;
}


function _CD(items, name) {
    var condition = {};
    var length = items.length;
    if (length === 1) {
        condition[name] = items[0];
    } else if (length > 1){
        condition[name] = {$in: items};
    }
    return condition;
}