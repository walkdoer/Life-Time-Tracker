'use strict';

var ServerAction = require('../actions/ServerAction');
var Q = require('q');
var isNodeWebkit = true;
var _ = require('lodash');
var config = require('../conf/config.js');


/** Global variables */

var _totalTime; //total active time

try {
    var a = global.process.version;
} catch (err) {
    isNodeWebkit = false;
}


function url(src) {
    if (isNodeWebkit) {
        return 'http://localhost:' + Ltt.serverPort + src;
    } else {
        return src;
    }
}


module.exports = {

    get: function (_url, data) {
        return get(url(_url), data);
    },
    post: function (_url, data) {
        return post(url(_url), data);
    },

    achieveGoal: function (date) {
        return get(url("/achieveGoal"), {date: date});
    },

    getLogContent: function (date, params) {
        return get(url('/logContents/' + date), params)
            .then(function (result) { return result.fileContent;});
    },

    writeLogContent: function (date, content) {
        return post(url('/logContents/' + date), {content: content});
    },

    stat: function (params) {
        return get(url('/stats'), params);
    },

    getAppInfo: function () {
        return get(url('/appInfo')).then(function (res) {
            return res;
        });
    },

    getProjects: function (query) {
        return get(url('/projects'), query).then(function (res) {
            ServerAction.receiveProjects(res);
        });
    },

    backUpLogFile: function (date, content) {
        return post(url('/backUpLogFile'), {date: date, content: content});
    },

    backUpLogFileByDate: function (date) {
        return get(url('/backUpLogFileByDate'), {date: date});
    },

    checkSyncStatus: function () {
        return get(url('/checkSyncStatus'));
    },

    checkLogContent: function (params) {
        return get(url('/checkLogContent'), params);
    },

    importLogContent: function (date, logContent) {
        return post(url('/importLogContent'), {date: date, logContent: logContent});
    },

    importByDate: function (date) {
        return get(url('/importByDate'), {date: date});
    },

    /**
     * get calendar data
     * @param  {String} calType calendar type
     * @param  {Object} params  start, end
     * @return {Promise}
     */
    calendar: function (params) {
        return get(url('/calendars'), params);
    },

    deleteProject: function (project) {
        var deferred = Q.defer();
        $.ajax({
            type:'delete',
            url: url('/projects/' + project._id),
            success: function (result) {
                deferred.resolve(result);
            },
            error: function (err) {
                deferred.reject(err);
            }
        });
        return deferred.promise;
    },

    Project: {
        load: function (params) {
            return get(url('/projects'), params);
        },

        get: function (id) {
            return get(url('/projects/' + id));
        }
    },

    totalTime: function (forceUpdate) {
        return this.Log.totalTime(forceUpdate);
    },

    Log: {

        load: function (params) {
            return get(url('/logs'), params);
        },

        totalTime: function (force) {
            if (_totalTime !== undefined && !force) {
                return Q(_totalTime);
            }
            return get(url('/logs'), {
                sum: true
            }).then(function (data) {
                if (data && data[0]) {
                    _totalTime = data[0].totalTime;
                }
                return _totalTime;
            });
        }
    },

    Affect: {
        load: function (params) {
            return get(url('/affects'), params);
        },

        create: function (affect) {
            return post(url('/affects'), affect);
        },

        destroy: function (affect) {
            //todo
        }
    },

    AffectRecord: {
        create: function (record) {
            return post(url('/affectRecords'), record);
        },

        load: function (params) {
            return get(url('/affectRecords'), params);
        }
    },

    Task: {
        load: function (params) {
            return get(url('/tasks'), params);
        },

        get: function (id) {
            return get(url('/tasks/' + id));
        },

        update: function (params) {
            console.log('update task');
            return post(url('/tasks/' + params.id), params);
        },

        delete: function (params) {
            console.log('delete ajax task' + params._id);
            return deleteObj(url('/tasks/' + params._id));
        },

        trend: function (params) {
            return get(url('/taskCountTrend'), params);
        },

        count: function (params) {
            return get(url('/countTasks'), params).then(function (result) { return result.count; });
        }
    },

    Goal: {

        create: function (goal) {
            return post(url('/goals'), goal);
        },

        load: function (params) {
            return get(url('/goals'), params);
        },

        update: function (params) {
            return post(url('/goals/' + params._id), params);
        },

        destroy: function (goal) {
            return deleteObj(url('/goals/' + goal._id));
        }
    },

    Tag: {
        load: function (params) {
            return get(url('/tags'), params);
        }
    },

    People: {
        load: function (params) {
            return get(url('/peoples'), params);
        }
    },

    Version: {
        load: function (params) {
            return get(url('/versions'), params);
        },

        get: function (id) {
            return get(url('/versions/' + id));
        },

        delete: function (id) {
            return deleteObj(url('/versions/' + id));
        }
    },

    Settings: {
        load: function () {
            return get(url('/settings'));
        },

        save: function (settings) {
            return post(url('/settings'), settings);
        }
    },

    Stat: {
        load: function (params) {
            return get(url('/stats'), params);
        },

        loadv1: function (params) {
            return get(url('/stat'), params);
        },

        wakeAndSleep: function (params) {
            return get(url('/wakeAndSleep'), params);
        },

        sleepLength: function (params) {
            return get(url('/sleepLength'), params);
        }
    },

    Class: {
        load: function (params) {
            return get(url('/classes'), params);
        },

        update: function (logClass) {
            return post(url('/classes/' + logClass._id), logClass);
        },

        delete: function (logClassId) {
            return deleteObj(url('/classes/' + logClassId));
        }
    },

    Routine: {
        load: function (params) {
            return get(url('/routine'), params);
        }
    }
};


function get(url, query) {
    var deferred = Q.defer();
    $.get(url, query)
     .done(function (res) {
        deferred.resolve(res);
     }).fail(function (err) {
        console.error(err.stack);
        deferred.reject(err);
     });

    return deferred.promise;
}

function post(url, data) {
    var deferred = Q.defer();
    $.ajax({
        url: url,
        data: data,
        type: 'post',
        dataType: 'json',
        success:function (res) {
            deferred.resolve(res);
        },
        error: function (err) {
            console.error(err.stack);
            deferred.reject(err);
        }
    });

    return deferred.promise;
}

function deleteObj(url, data) {
    var deferred = Q.defer();
    $.ajax({
        url: url,
        data: data,
        type: 'delete',
        success:function (res) {
            deferred.resolve(res);
        },
        error: function (err) {
            console.error(err.stack);
            deferred.reject(err);
        }
    });

    return deferred.promise;
}