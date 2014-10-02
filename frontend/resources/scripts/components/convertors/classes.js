define(function (require, exports) {
    'use strict';
    var _ = require('underscore');
    exports.dispose = function (rawData) {
        var result = {
            type: 'pie'
        };
        var pieData = [], total = 0;
        _.each(rawData, function (d) {
            total += d.count;
        });

        _.each(rawData, function (d) {
            pieData.push([d.label, d.count / total * 100]);
        });

        result.data = pieData;
        return result;
    };
});
