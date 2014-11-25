'use strict';
var _ = require('lodash');
var helper = require('./helper');
var chartHelper = require('../components/charts/helper');
exports.dispose = function (rawData, options) {

    var categories = chartHelper.getCategoriesForCompareDatas(rawData);
    options = _.extend({
        unit: 'hour'
    }, options);
    var data = [];
    var timeUnit = options.unit;

    rawData.forEach(function (d) {
        var name = d.name;
        var values = d.values;
        values = categories.map(function (category) {
            var val = getValue(values, category);
            return val === null ? 0 : getTimeValue(val);
        });
        data.push({
            name: name,
            data: values
        });
    });

    function getValue(values, category) {
        if (_.isObject(values) && !_.isArray(values)) {
            return values[category] || null;
        } else if (_.isArray(values)) {
            var nameKey = helper.getNameKey(values);
            var valueKey = helper.getValueKey(values);
            var target = values.filter(function (val) {
                return val[nameKey] === category;
            })[0];
            return target ? target[valueKey] : null;
        }
    }

    function getTimeValue(val) {
        if (timeUnit === 'hour') {
            val = Math.round(val / 60 * 100) / 100;
        }
        return val;
    }
    return data;
};
