/**
 * the entr of scanner
 */
'use strict';
var msg = require('./message');
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
    if (scanner) {
        return scanner.scan(options);
    } else {
        msg.error('Sorry Can\'t find handler for you!');
    }
};
