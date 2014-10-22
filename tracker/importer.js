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
        files: files
    });
});


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
        var logModel = toLogModel(date, log);
        logModel.save(function(err) {
            if (err) {
                console.error(err);
            }
        });
    });
}


function toLogModel(date, log) {
    date = new Moment(date).format('YYYY-MM-DD');
    return new Log({
        date: date,
        start: log.start,
        classes: log.classes,
        end: log.end,
        tags: log.tags,
        projects: log.projects,
        origin: log.origin
    });
}




function importFromLogFile(options) {
    var deferred = Q.defer();
    //scan the data
    scanner.scan(options)
        //ite to database
        .then(function (scanResult) {
            var days = scanResult.days || [scanResult];
            importProjects(helper.getAllProjects(days));
            days.forEach(function (day) {
                importDay(day);
            });
        }).then(function () {
            Msg.success('logs have been imported into database successfully.');
        }).catch(function (err) {
            Msg.error('Something wrong happen when imported logs into database.');
            throw err;
        });
    return deferred.promise;
}


function importProjects(projects) {
    projects.forEach(function (project) {
        saveProject(project);
    });
}

function saveProject(project) {
    var version = project.version;
    var queryCondition = {
        name: project.name
    };
    if (version) {
        queryCondition.version = version;
    } 
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

exports.importFromLogFile = importFromLogFile;