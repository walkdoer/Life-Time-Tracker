'use strict';
var scanner = require('../../scanner');
var Q = require('q');
var helper = require('../../helper');
exports.get = function (attrItem, options) {
    var deferred = Q.defer();
    scanner.scan(options)
        .then(function (scanResult) {
            var projects = helper.extract(attrItem, scanResult.days || [scanResult], options);
            deferred.resolve(projects);
        });
    return deferred.promise;
};
