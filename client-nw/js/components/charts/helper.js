/**
 * chart helper
 */

 var _ = require('lodash');

function getCategories(data) {
    var categories = [];
    if (_.isArray(data)) {
        _.each(data, function(d) {
            categories.push(d.name || d.label);
        });
    } else if (_.isObject(data)){
        categories = _.keys(data);
    }
    return categories;
}

function getCategoriesForCompareDatas(datas) {
    var categorys = [];
    datas.forEach(function (data) {
        categorys = categorys.concat(getCategories(data.values));
    }, this);
    return _.uniq(categorys);
}

exports.getCategories = getCategories;
exports.getCategoriesForCompareDatas = getCategoriesForCompareDatas;