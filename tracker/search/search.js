/**
 * search logs
 *
 */

'use strict';


var Q = require('q');
var Log = require('../model/log');

exports.query = function (options) {
    var deferred = Q.defer();
    queryLog(options, function (result) {
        deferred.resolve(result.map(function (item) {
            return item.toJSON();
        }));
    }, function (err) {
        deferred.reject(err);
    });
    return deferred.promise;
};


function queryLog(options, onSuccess, onError) {

    Log.find(function (err, result) {
        if (err) {
            onError(err);
        } else {
            onSuccess(result);
        }
    });
}
