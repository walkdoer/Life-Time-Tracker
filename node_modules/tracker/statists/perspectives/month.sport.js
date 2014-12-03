'use strict';
var daySport = require('./day.sport');

exports.focus = function (options, scanResult) {
    scanResult.days.forEach(daySport.processSportLog);
    var statResult = daySport.stat(scanResult);
    return statResult;
};

