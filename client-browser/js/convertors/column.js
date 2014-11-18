'use strict';
var _ = require('lodash');
var helper = require('./helper');
exports.dispose = function (rawData, options) {
    options = _.extend({
        unit: 'hour'
    }, options);
    var result = {};
    var data = [];
    var timeUnit = options.unit;
    if (_.isArray(rawData)) {
        var valueKey = helper.getValueKey(rawData);
        _.each(rawData, function (d) {
            data.push([d.name || d.label, getValue(d[valueKey])]);
        });
    } else if (_.isObject(rawData)) {
        data = _.values(rawData).map(function (value) {
            return getValue(value);
        });
    }

    function getValue(val) {
        if (timeUnit === 'hour') {
            val = val / 60;
        }
        return val;
    }
    result.data = data;
    return [result];
};
