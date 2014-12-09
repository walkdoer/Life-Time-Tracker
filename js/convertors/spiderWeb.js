var _ = require('lodash');
var helper = require('./helper');
exports.dispose = function (rawData, categories) {
    var values = [];
    if (_.isArray(rawData) && _.isArray(categories)) {
        var valueKey = helper.getValueKey(rawData);
        categories.forEach(function (category) {
            var target = rawData.filter(function (d) {
                return d.code === category;
            })[0];
            values.push(target ? target[valueKey] : 0);
        });
    }/* else if (_.isObject(rawData)) {
        var keyValuePair = _.pairs(rawData);
        keyValuePair.forEach(function (pair) {
            total = pair[1];
        });
        keyValuePair.forEach(function (pair) {
            pieData.push([pair[0], pair[1] / total * 100]);
        });
    }*/
    var data = {
        labels: categories,
        datasets: [{
            fillColor: "rgba(71, 188, 195, 0.2)",
            strokeColor: "rgba(220,220,220,1)",
            pointColor: "rgba(220,220,220,1)",
            pointStrokeColor: "#fff",
            pointHighlightFill: "#fff",
            pointHighlightStroke: "rgba(220,220,220,1)",
            data: values
        }]
    };
    return data;
};