/**
 * day statist
 * the responsibility of day statist is to analyse daily life of a person
 * for example, stat all the aspect of everyday life,such as sport, work,
 * sleep, study and so on.
 */
'use strict';
var overviewPerspective = require('./perspectives/day.overview');
var msg = require('../message');
var perspectiveCache = {};
var globalConfig = require('../conf/config.json');

/**
 * dispose the scan result of the scanner
 * @param scanResult
 */
exports.dispose = function (options, scanResult) {
    var statResult = overviewPerspective.focus(options, scanResult),
        perspectives = [];
    if (options.perspective) {
        perspectives.push(options.perspective);
    } else {
        perspectives = perspectives.concat(globalConfig.defaultPerspectives);
    }
    perspectives.forEach(function (key) {
        var perspectiveName = key.toLowerCase(),
            perspective;
        try {
            perspective = perspectiveCache[perspectiveName];
            if (perspective === undefined) {
                perspective = require('./perspectives/day.' + perspectiveName);
                perspectiveCache[perspectiveName] = perspective;
            }
        } catch (e) {
            msg.warn('Perspective ' + perspectiveName + ' for day stat is Not Exsit');
            perspectiveCache[perspectiveName] = false;
        }
        if (perspective) {
            //use name like sportPerspective to save the stat result
            var name = perspectiveName + 'Perspective';
            statResult[name] = perspective.focus(options, scanResult, statResult);
        }
    });
    //save the raw data of log;
    statResult.scanResult = scanResult;
    return statResult;
};


