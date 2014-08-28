/**
 * day statist
 * the responsibility of day statist is to analyse the life the the master
 * for example, stat all the aspect of everyday life,such as sport, work,
 * sleep, study and so on.
 */
'use strict';
var logClassEnum = require('../enum/logClass'),
    util = require('../util'),
    overviewPerspective = require('./perspectives/overview');
var msg = require('../message');
var perspectiveCache = {};
var logClassMap = util.inversObj(logClassEnum);
/**
 * dispose the scan result of the scanner
 * @param scanResult
 */
exports.dispose = function (options, scanResult) {
    var date = options.dateStr,
        statResult = {},
        perspective,
        perspectives;
    if (options.logClass) {
        perspective = logClassMap[options.logClass];
        perspectives = [perspective];
    } else {
        statResult = overviewPerspective.focus(date, scanResult);
        perspectives = ['sport'];
    }
    perspectives.forEach(function (key) {
        var perspectiveName = key.toLowerCase(),
            perspective;
        try {
            perspective = perspectiveCache[perspectiveName];
            if (perspective === undefined) {
                perspective = require('./perspectives/' + perspectiveName);
                perspectiveCache[perspectiveName] = perspective;
            }
        } catch (e) {
            msg.warn('Perspective ' + perspectiveName + ' is Not Exsit');
            perspectiveCache[perspectiveName] = false;
        }
        if (perspective) {
            //use name like sportPerspective to save the stat result
            var name = perspectiveName + 'Perspective';
            statResult[name] = perspective.focus(options, scanResult);
        }
    });
    //save the raw data of log;
    statResult.scanResult = scanResult;
    statResult.fileContent = scanResult.fileContent;
    return statResult;
};


