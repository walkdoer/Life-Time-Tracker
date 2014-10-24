/**
 * import logs to database
 */

'use strict';

var scanner = require('./scanner');
var Q = require('q');
var Log = require('./model/log');
var Project = require('./model/project');
var Task = require('./model/task');
var Moment = require('moment');
var syncNoteSig = require('./globalSignals').syncNote;
var Msg = require('./message');
var _ = require('lodash');
var helper = require('./helper');

//import note to database after sync success;
syncNoteSig.add(function (files) {
    importFromLogFile({
        files: files,
        type: 'logs'
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
            switch (options.type) {
                case 'projects':
                    importProjects(helper.getAllProjects(days));
                    break;
                case 'logs':
                    importLogs(days);
                    break;
                default:
                    importProjects(helper.getAllProjects(days))
                        .then(function () {
                            importLogs(days);
                        });
            }
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
    days.forEach(function (day) {
        waitToImportedLogCount += day.logs.length;
        importDay(day);
    });
    Msg.info('Import Logs Count:' + waitToImportedLogCount);
}

function importDay(day) {
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

    logs.forEach(function (log) {
        //import task;
        importTask(log.task).then(function (taskId) {
            //transform to LogModel and then save
            //async is because need to get the project's _id as referrence
            toLogModel(date, log, {taskId: taskId})
                .then(function (logModel) {
                    logModel.save(function(err) {
                        if (err) {
                            Msg.error('Save Log failed!', err);
                        } else {
                            importedLogCount++;
                        }
                        if (importedLogCount === waitToImportedLogCount) {
                            Msg.success('Import Logs Success, count:' + importedLogCount);
                        }
                    });
                }).catch(function (err) {
                    var msg = 'persisting Log Object' + log.origin;
                    if (!err) {
                        msg += ' project is not exist';
                    }
                    Msg.error(msg, err);
                });
        }).catch(function (err) {
            Msg.error('import task of log failed!');
        });
    });
}


/**
 * transform log to LogModel
 * @param  {String} date
 * @param  {Object} log
 * @return {Log}
 */
function toLogModel(date, log, refer) {
    var deferred = Q.defer();
    date = new Moment(date).format('YYYY-MM-DD');
    var projects = log.projects;
    var queryCondition;
    if (!_.isEmpty(projects)) {
        queryCondition = getProjectQueryCondition(projects[0]);
        Project.findOne(queryCondition, function (err, project) {
                if (err || !project) {
                    deferred.reject(err);
                    return;
                }
                deferred.resolve(new Log({
                    date: date,
                    start: log.start,
                    classes: log.classes,
                    end: log.end,
                    tags: log.tags,
                    project: project.id,
                    task: refer.taskId || null,
                    origin: log.origin
                }));
            });
    } else {
        deferred.resolve(new Log({
            date: date,
            start: log.start,
            classes: log.classes,
            end: log.end,
            tags: log.tags,
            origin: log.origin
        }));
    }

    return deferred.promise;
}

/**
 * import project to database
 * 
 * @param  {Array[Project]} projects
 */
function importProjects(projects) {
    var promises = projects.map(function (project) {
        return saveProject(project);
    });
    return Q.allSettled(promises);
}


function saveProject(project) {
    var deferred = Q.defer();
    var queryCondition = getProjectQueryCondition(project, true);
    //check the existence of project
    Project.count(queryCondition, function (err, count) {
        if (err) {
            throw err;
        }
        if (count === 0) {
            var projectModel = new Project(project);
            //save to database
            projectModel.save(function (err) {
                if (err) {
                    Msg.error('Project' + ' save failed!' + JSON.stringify(project), err);
                    deferred.reject(err);
                    return;
                }
                deferred.resolve();
            });
        } else {
            Msg.debug('Project ' + project.name + ' exists');
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

function importTask(taskObj) {
    var deferred = Q.defer();
    if (!taskObj) {
        deferred.resolve(null);
    } else {
        Task.findOne({name: taskObj.name}, function (err, task) {
            //if task already exist
            if (task) {
                Msg.debug('Task ' + taskObj.name + ' exist ' + task.id);
                deferred.resolve(task.id);
            } else {
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