/**
 * the entr of scanner
 */
'use strict';
var msg = require('./message');
var dateTypeEnum = require('./enum/dateType');

/**
 * dispatch the scan task to the corresponding scanner
 */
exports.scan = function (options) {
    var scanner = null;
    if (options.dateType === dateTypeEnum.Day) {
        scanner = require('./scanners/dayLifeScanner');
    } else if (options.dateType === dateTypeEnum.Month){
        scanner = require('./scanners/monthLifeScanner');
    } else if (options.dateType === dateTypeEnum.Year) {
        scanner = require('./scanners/yearLifeScanner');
    }
    if (scanner) {
        return scanner.scan(options);
    } else {
        msg.error('Sorry Can\'t find handler for you!');
    }
};
