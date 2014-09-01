/**
 * sport calendar
 */

'use strict';

var scanner = require('../scanner');
exports.generate = function(options) {
    scanner.scan(options)
        .then(function(scanResult) {
            console.log(scanResult);
        });
};
