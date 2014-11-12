'use strict';
var _ = require('lodash');
var helper = require('./helper');
exports.dispose = function (rawData) {
    var result = {
        type: 'pie'
    };
    var valueKey = helper.getValueKey(rawData);
    var pieData = [],
        total = 0;
    _.each(rawData, function (d) {
        total += d[valueKey];
    });

    _.each(rawData, function (d) {
        pieData.push([d.name || d.label, d[valueKey] / total * 100]);
    });

    result.data = pieData;
    return result;
};