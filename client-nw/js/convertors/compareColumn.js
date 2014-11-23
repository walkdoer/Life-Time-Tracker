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

    rawData.forEach(function (d) {
        var name = d.name;
        var values = _.values(d.values).map(function (value) {
                return getValue(value);
            });
        data.push({
            name: name,
            data: values
        });
    });

    function getValue(val) {
        if (timeUnit === 'hour') {
            val = Math.round(val / 60 * 100) / 100;
        }
        return val;
    }
    return data;
};
