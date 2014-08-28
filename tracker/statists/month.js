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

exports.dispose = function(options, scanResult) {
    var statResult,
        perspective,
        perspectives;

    scanResult.days = scanResult.days.map(function (d) {
        var dayOptions = extend({}, options, {dateStr: d.date});
        d = dayStat.dispose(dayOptions, d);
        return d;
    });
    if (options.logClass) {
        perspective = logClassMap[options.logClass];
        perspectives = [perspective];
    } else {
        statResult = overviewPerspective.focus(scanResult);
        perspectives = ['sport'];
    }
    perspectives.forEach(function (key) {
        console.log(key);
    });

    return statResult;

};

