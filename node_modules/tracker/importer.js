/**
 * import logs to database
 */

'use strict';

var scanner = require('./scanner');
var Q = require('q');
var Log = require('./model/log');
var Project = require('./model/project');
var Task = require('./model/task');
var syncNoteSig = require('./globalSignals').syncNote;
var Msg = require('./message');
var _ = require('lodash');

//import note to database after sync success;
syncNoteSig.add(function (files) {
    importFromLogFile({
        files: files
    });
});

var importedLogCount = 0;


/**
 * import data from log file into database
 * @param  {Object} options
 * @return {Promise}
 */
function importFromLogFile(options) {
    var deferred = Q.defer();
    //scan the data
    scanner.scan(options)
        .then(function (scanResult) {
            var days = scanResult.days || [scanResult];
            importLogs(days);
        }).then(function () {
            Msg.success('logs have been imported into database successfully.');
        }).catch(function (err) {
            Msg.error('Something wrong happen when imported logs into database.');
            throw err;
        });
    return deferred.promise;
}


var waitToImportedLogCount = 0,
    totalNumberRemoved = 0;
function importLogs(days) {
    waitToImportedLogCount = 0;
    totalNumberRemoved = 0;

    days.reduce(function (promise, day) {
        waitToImportedLogCount += day.logs.length;
        return promise.then(importDay.bind(null, day));
    }, Q(1));
    Msg.info('Import Logs Count:' + waitToImportedLogCount);
}

function importDay(day) {
    var deferred = Q.defer();
    var logs = day.logs;
    var date = day.date;
    if (_.isEmpty(logs)) {
        Msg.warn('[import log]' + date + '\'s have no log');
        return;
    }

    //remove the same day's log before import
    Log.remove({
        date: new Date(day.date)
    }, function (err, numberRemoved) {
        if (err) {
            Msg.error('清空失败' + date, err);
        }
        if (!numberRemoved) {
            Msg.error('清空失败:' + date);
        } else {
            Msg.debug('已清空' + date + '的数据' + numberRemoved);
        }
        totalNumberRemoved += numberRemoved;
    });
    //insert sequence, make sure that task will not repeat
    logs.reduce(function(promise, log) {
        return promise.then(importLog.bind(null, date, log));
    }, Q(1)).then(function () {
        deferred.resolve();
        Msg.success('Import Day' + date + ' success!');
    });
    return deferred.promise;
}


function importLog(date, log) {
    var deferred = Q.defer();
    //importProject
    importProject(log.projects[0]).then(function (projectId) {
        //import task;
        importTask(log.task, projectId).then(function (taskId) {
            //if have subTask, then save the subtask with parent task Id
            if (log.subTask) {
                log.subTask.parent = taskId;
                importTask(log.subTask, projectId).then(function (taskId) {
                    saveLog({
                        project: projectId,
                        task: taskId
                    });
                });
            } else {
                saveLog({
                    project: projectId,
                    task: taskId
                });
            }

            function saveLog(refer) {
                var logModel = new Log(_.extend({date: date}, log, refer));
                logModel.save(function(err, log) {
                    if (err) {
                        Msg.error('Save Log failed!', err);
                    } else {
                        importedLogCount++;
                        Msg.success('Import Log Success' + log.origin);
                        deferred.resolve();
                    }
                    if (importedLogCount === waitToImportedLogCount) {
                        Msg.success('Import Logs finished, count:' + importedLogCount);
                    }
                });
            }
        }).catch(function (err) {
            Msg.error('import task of log failed!', err);
        });
    }).catch(function (err) {
        Msg.error('import project fail', err);
    });
    return deferred.promise;
}

function importProject(project) {
    var deferred = Q.defer();
    if (!project) {
        deferred.resolve(null);
        return deferred.promise;
    }
    var queryCondition = getProjectQueryCondition(project);
    //check the existence of project
    Project.findOne(queryCondition, function (err, result) {
        if (err) {
            throw err;
        }
        if (!result) {
            var projectModel = new Project(project);
            //save to database
            projectModel.save(function (err, result) {
                if (err) {
                    Msg.error('Project' + ' save failed!' + JSON.stringify(project), err);
                    deferred.reject(err);
                    return;
                }
                Msg.success('Project ' + project.name + ' save success!');
                deferred.resolve(result.id);
            });
        } else {
            Msg.debug('Project ' + project.name + ' exists');
            deferred.resolve(result.id);
        }
    });
    return deferred.promise;
}

function getProjectQueryCondition(project, exceptVersion) {
    var version = project.version;
    var queryCondition = {
        name: project.name,
    };
    if (version) {
        queryCondition.version = version;
    } else if (exceptVersion) {
        queryCondition.version = {$exists: false};
    }
    return queryCondition;
}




function importTask(taskObj, projectId) {
    var deferred = Q.defer();
    if (!taskObj) {
        deferred.resolve(null);
    } else {
        var condition = {name: taskObj.name};
        if (projectId) {
            condition.projectId = projectId;
        }
        Task.findOne(condition, function (err, task) {
            //if task already exist
            if (task) {
                Msg.debug('Task ' + taskObj.name + ' exist ' + task.id);
                deferred.resolve(task.id);
            } else {
                taskObj.projectId = projectId;
                var taskModel = new Task(taskObj);
                taskModel.save(function (err, result) {
                    if (err) {
                        Msg.error('Import Task' + taskObj.name, err);
                        deferred.reject(err);
                    }
                    Msg.debug(result.name + ' import success. _id:' + result.id);
                    deferred.resolve(result.id);
                });
            }
        });
    }
    return deferred.promise;
}

exports.importFromLogFile = importFromLogFile;