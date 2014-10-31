define(function (require, exports) {
    'use strict';
    var _ = require('underscore');
    var helper = require('./helper');
    exports.dispose = function (rawData) {
        var result = {name: '标签'};
        var data = [];
        var valueKey = helper.getValueKey(rawData);
        _.each(rawData, function (d) {
            data.push([d.name || d.label, d[valueKey]]);
        });
        result.data = data;
        return [result];
    };
});
