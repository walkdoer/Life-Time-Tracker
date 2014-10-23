/**
 * import logs to database
 */

'use strict';

var scanner = require('./scanner');
var Q = require('q');
var Log = require('./model/log');
var Project = require('./model/project');
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





function importFromLogFile(options) {
    var deferred = Q.defer();
    //scan the data
    scanner.scan(options)
        //ite to database
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
                    importProjects(helper.getAllProjects(days));
                    importLogs(days);
            }
        }).then(function () {
            Msg.success('logs have been imported into database successfully.');
        }).catch(function (err) {
            Msg.error('Something wrong happen when imported logs into database.');
            throw err;
        });
    return deferred.promise;
}


function importLogs(days) {
    days.forEach(function (day) {
        importDay(day);
    });
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
    }, function (err) {
        if (err) {
            console.error(err);
        }
    });

    logs.forEach(function (log) {
        //transform to LogModel and then save
        //async is because need to get the project's _id as referrence
        toLogModel(date, log)
            .then(function (logModel) {
                logModel.save(function(err) {
                    if (err) {
                        console.error(err);
                    }
                });
            }).catch(function (err) {
                Msg.error('Error occur when persisting Log Object', err);
            });
    });
}


/**
 * transform log to LogModel
 * @param  {String} date
 * @param  {Object} log
 * @return {Log}
 */
function toLogModel(date, log) {
    var deferred = Q.defer();
    date = new Moment(date).format('YYYY-MM-DD');
    var projects = log.projects;
    var queryCondition;
    if (!_.isEmpty(projects)) {
        queryCondition = getProjectQueryCondition(projects[0]);
        Project.findOne(queryCondition, function (err, project) {
                if (err) {
                    deferred.reject(err);
                }
                if (queryCondition.name === 'WA' && !queryCondition.version) {
                    console.log('WA', project.id);
                }
                deferred.resolve(new Log({
                    date: date,
                    start: log.start,
                    classes: log.classes,
                    end: log.end,
                    tags: log.tags,
                    project: project.id,
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
    projects.forEach(function (project) {
        saveProject(project);
    });
}


function saveProject(project) {
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
                    Msg.error('Project' + ' save failed!' + JSON.stringify(project));
                    console.error(err);
                    return;
                }
            });
        } else {
            Msg.debug('Project ' + project.name + ' exists');
        }
    });
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

exports.importFromLogFile = importFromLogFile;