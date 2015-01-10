'use strict';

var Q = require('q');
var conf = require('../conf/config');
var server = conf.server;
exports.get = function (url, params) {
    var deferred = Q.defer();
    $.ajax({
        url: server + url,
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
