'use strict';
var _ = require('lodash');
var helper = require('./helper');
exports.dispose = function (rawData) {
    var result = {
        type: 'pie'
    };
    var pieData = [];
    if (_.isArray(rawData)) {
        var valueKey = helper.getValueKey(rawData),
            total = 0;
        _.each(rawData, function (d) {
            total += d[valueKey];
        });

        _.each(rawData, function (d) {
            pieData.push([d.name || d.label, d[valueKey] / total * 100]);
        });
    } else if (_.isObject(rawData)) {
        var keyValuePair = _.pairs(rawData);
        keyValuePair.forEach(function (pair) {
            total = pair[1];
        });
        keyValuePair.forEach(function (pair) {
            pieData.push([pair[0], pair[1] / total * 100]);
        });
    }
    result.data = pieData;
    return result;
};