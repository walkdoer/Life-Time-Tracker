'use strict';
var $ = require('jquery');
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
        }
    });
    return deferred.promise;
};
