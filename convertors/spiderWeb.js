var _ = require('lodash');
var helper = require('./helper');
var extend = require('extend');
exports.dispose = function (rawData, categories, isGroup) {
    var values, valuesGroup, data, names;
    if (_.isArray(rawData) && _.isArray(categories)) {
        if (isGroup) {
            names = [];
            valuesGroup = rawData.map(function (data) {
                names.push(data.name);
                return getValues(data.values);
            });
        } else {
            names = [''];
            values = getValues(rawData);
        }
    }/* else if (_.isObject(rawData)) {
        var keyValuePair = _.pairs(rawData);
        keyValuePair.forEach(function (pair) {
            total = pair[1];
        });
        keyValuePair.forEach(function (pair) {
            pieData.push([pair[0], pair[1] / total * 100]);
        });
    }*/
    if (values) {
        data = wrapData(values, false, names);
    } else if (valuesGroup) {
        data = wrapData(valuesGroup, true, names);
    }
    return data;

    function getValues(rawData) {
        var values = [];
        var valueKey = helper.getValueKey(rawData);
        categories.forEach(function (category) {
            var target = rawData.filter(function (d) {
                return d.id === category;
            })[0];
            values.push(target ? target[valueKey] : 0);
        });
        return values;
    }

    function wrapData (data, isGroup, names) {
        var colors = [{
            fillColor: "rgba(220,220,220,0.2)",
            strokeColor: "rgba(220,220,220,1)",
            pointColor: "rgba(220,220,220,1)",
            pointStrokeColor: "#fff",
            pointHighlightFill: "#fff",
            pointHighlightStroke: "rgba(220,220,220,1)"
        }, {
            fillColor: "rgba(151,187,205,0.2)",
            strokeColor: "rgba(151,187,205,1)",
            pointColor: "rgba(151,187,205,1)",
            pointStrokeColor: "#fff",
            pointHighlightFill: "#fff",
            pointHighlightStroke: "rgba(151,187,205,1)",
        }];

        return {
            labels: categories,
            datasets: getDatasets(data, isGroup, names)
        };

        function getDatasets(data, isGroup) {
            if (isGroup) {
                return data.map(function (data, index) {
                    var color = pickColor();
                    return extend({
                        label: names[index],
                        data: data
                    }, color);
                });
            } else {
                var color = pickColor();
                return [extend({
                    label: names[0],
                    data: data
                }, color)];
            }
        }

        function pickColor() {
            var pickedColor = getColorInSequence();
            //if the color is run out, then reuse the color list;
            if (!pickedColor) {
                resetColors();
            }
            return getColorInSequence();

            function getColorInSequence() {
                var color = colors.filter(function (color) {
                    return !color.used;
                })[0];
                if (color) {
                    color.used = true;
                }
                return color;
            }

            function resetColors() {
                colors.forEach(function (color){
                    color.used = false;
                });
            }
        }
    }
};