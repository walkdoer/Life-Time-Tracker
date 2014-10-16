/**
 * the entr of scanner
 */
'use strict';
var msg = require('./message');
var dateTypeEnum = require('./enum/dateType');

/**
 * dispatch the scan task to the corresponding scanner
 */
exports.scan = function(options) {
    var scanner = require('./scanners/lifeScanner');
    var dateItems = options.dateItems;
    var dateItemLen;
    if (!dateItems) {
        dateItemLen = -1;
    } else {
        dateItemLen = dateItems.length;
    }
    if (dateItemLen === 1) {
        var dateType = dateItems[0].type;
        if (dateType === dateTypeEnum.Day) {
            scanner = require('./scanners/dayLifeScanner');
        } else if (dateType === dateTypeEnum.Month) {
            scanner = require('./scanners/lifeScanner');
        } else if (dateType === dateTypeEnum.Year) {
            scanner = require('./scanners/yearLifeScanner');
        }
    } else if (dateItemLen > 1) {
        scanner = require('./scanners/lifeScanner');
    }

    if (scanner) {
        return scanner.scan(options);
    } else {
        msg.error('Sorry Can\'t find handler for you!');
    }
};
