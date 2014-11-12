'use strict';
var _ = require('lodash');
var helper = require('./helper');
exports.dispose = function (rawData) {
    var result = {};
    var data = [];
    if (_.isArray(rawData)) {
        var valueKey = helper.getValueKey(rawData);
        _.each(rawData, function (d) {
            data.push([d.name || d.label, d[valueKey]]);
        });
    } else if (_.isObject(rawData)) {
        data = _.values(rawData);
    }
    result.data = data;
    return [result];
};
