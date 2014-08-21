/**
 * day statist
 * the responsibility of day statist is to analyse the life the the master
 * for example, stat all the aspect of everyday life,such as sport, work,
 * sleep, study and so on.
 */
'use strict';
var helper = require('../helper');

/**
 * dispose the scan result of the scanner
 * @param scanResult
 */
exports.dispose = function (scanResult) {
    var statResult = {
        scanResult: scanResult
    };
    var fileContent = scanResult.fileContent,
        logs = scanResult.logs,
        trackedTime = 0,
        wakeMoment,
        lastMoment,
        sleepMoment;
    //check the correctness of time frequence for the logs
    helper.checkLogSequence(logs);
    statResult.classes = helper.getClasses(fileContent).sort(frequenceDesc);
    statResult.tags = helper.getTags(fileContent).sort(frequenceDesc);
    statResult.projects = helper.getProjects(fileContent);

    //last index of the logs
    var lastIndex = logs.length - 1;
    logs.forEach(function(log, index) {
        if (log.wake) {
            wakeMoment = log.time;
        } else if (log.sleep){
            sleepMoment = log.time;
        } else if (log.offDuty) {
            statResult.offDutyMoment = log.time;
        }
        if (log.len !== undefined) {
            trackedTime += log.len;
        }
        if (lastIndex === index) {
            lastMoment = log.end;
        }
    });
    return statResult;
    function frequenceDesc(a, b) {
        return b.frequence - a.frequence;
    }
};


