/**
 * month statist
 *
 * provide a landscape view of life in a month
 * for example
 *    total sleep time
 *    total work time
 * group time consume in different dimensions;
 */

'use strict';


var util = require('../util');
var logClassEnum = require('../enum/logClass');
var logClassMap = util.inversObj(logClassEnum);
var overviewPerspective = require('./perspectives/monthOverview');
var dayStat = require('./day');
var extend = require('node.extend');
var msg = require('../message');
var dateTypeEnum = require('../enum/dateType');

var perspectiveCache = {};
exports.dispose = function(options, scanResult) {
    var statResult = {},
        perspective,
        perspectives;

    scanResult.days = scanResult.days.map(function (d) {
        var dayOptions = extend({}, options, {
            dateStr: d.date,
            dateType: dateTypeEnum.Day
        });
        var statResult = dayStat.dispose(dayOptions, d);
        return extend(d, statResult);
    });
    if (options.logClass) {
        perspective = logClassMap[options.logClass];
        perspectives = [perspective];
    } else {
        statResult = overviewPerspective.focus(scanResult);
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
    statResult.scanResult = scanResult;
    return statResult;
};

