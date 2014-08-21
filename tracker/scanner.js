/**
 * the entr of scanner
 */
'use strict';


var lifeScanner = require('./scanners/lifeScanner');

/**
 * dispatch the scan task to the corresponding scanner
 */
exports.scan = function (options) {
    return lifeScanner.scan(options);
};
