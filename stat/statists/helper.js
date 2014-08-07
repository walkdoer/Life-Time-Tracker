/**
 * stat helper
 * define the common function that use by the statists here.
 */
'use strict';


exports.getLogs = function(data) {
    var logArr = data.split('\n').filter(isEmpty);
    return logArr;
};

exports.getTags = function(data) {
    var result = data.match(/\[(.*)\]/ig);
    var tags = [];
    result.forEach(function(tagStr) {
        var tagArr;
        tagStr = tagStr.trim().replace(/[\[\]]/ig, '');
        if (tagStr) {
            tagArr = tagStr.split(',');
        }
        tags = tags.concat(tagArr);
    });
    //unique the tags array
    return tags.filter(onlyUnique);
};

function isEmpty(val) {
    return !!val;
}

function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
}
