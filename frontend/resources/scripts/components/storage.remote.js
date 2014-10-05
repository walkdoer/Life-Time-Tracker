define(function (require, exports) {

    'use strict';
    var q = require('q');
    exports.get = function (url, params) {
        var deferred = q.defer();
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
});
