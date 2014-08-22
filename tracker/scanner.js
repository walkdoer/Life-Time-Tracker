/**
 * the entr of scanner
 */
'use strict';

var logClassEnum = require('./enum/logClass');
var lifeScanner = require('./scanners/lifeScanner');
var sportScanner = require('./scanners/sportScanner');

/**
 * dispatch the scan task to the corresponding scanner
 */
exports.scan = function (options) {
    var scanner = null;
    if (options.logClass === logClassEnum.NormalThing) {
        scanner = lifeScanner;
    } else if (options.logClass === logClassEnum.Sport) {
        scanner = sportScanner;
    }

    return scanner.scan(options);
};
