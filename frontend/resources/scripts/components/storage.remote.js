define(function (require, exports) {

    'use strict';
    var q = require('q');
    exports.get = function (url) {
        var deferred = q.defer();
        $.get(url)
            .done(function(result) {
                deferred.resolve(result);
            });
        return deferred.promise;
    };
});
