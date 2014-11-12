'use strict';

var Q = require('q');
exports.get = function (url, params) {
    var deferred = Q.defer();
    $.ajax({
        url: url,
        data: params,
        success: function (result) {
            deferred.resolve({
                params: params,
                data: result
            });
        },
        error: function (err) {
            deferred.reject(err);
        }
    });
    return deferred.promise;
};
