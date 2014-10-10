define(function (require, exports) {
    'use strict';
    var _ = require('underscore');
    exports.dispose = function (rawData) {
        var result = {name: '标签'};
        var data = [];
        _.each(rawData, function (d) {
            data.push([d.name, d.time]);
        });
        result.data = data;
        return [result];
    };
});
