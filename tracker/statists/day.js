/**
 * day statist
 * the responsibility of day statist is to analyse the life the the master
 * for example, stat all the aspect of everyday life,such as sport, work,
 * sleep, study and so on.
 */
'use strict';
var logClassEnum = require('../enum/logClass'),
    overviewPerspective = require('./perspectives/overview');
var msg = require('../message');

/**
 * dispose the scan result of the scanner
 * @param scanResult
 */
exports.dispose = function (options, scanResult) {
    var statResult = overviewPerspective.focus(options.dateStr, scanResult);
    Object.keys(logClassEnum).forEach(function (key) {
        var perspectiveName = key.toLowerCase(),
            perspective;
        try {
            perspective = require('./perspectives/' + perspectiveName);
        } catch (e) {
            msg.warn('Perspective ' + perspectiveName + 'is Not Exsit');
        }
        if (perspective) {
            //use name like sportPerspective to save the stat result
            var name = perspectiveName + 'Perspective';
            statResult[name] = perspective.focus(options.dateStr, scanResult);
        }
    });
    //save the raw data of log;
    statResult.scanResult = scanResult;
    statResult.fileContent = scanResult.fileContent;
    return statResult;
};


