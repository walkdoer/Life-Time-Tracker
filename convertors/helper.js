/**
* convertor helper
*/
'use strict';
exports.getValueKey = function (rawData) {
    var valueKey, firstRecord = rawData[0];
    //if no record
    if (!firstRecord) {
        return null;
    }
    if (firstRecord.time !== undefined) {
        valueKey = 'time';
    } else if (firstRecord.count !== undefined) {
        valueKey = 'count';
    } else if (firstRecord.value !== undefined) {
        valueKey = 'value';
    }
    return valueKey;
};

exports.getNameKey = function (rawData) {
    var key, firstRecord = rawData[0];
    if (firstRecord.name !== undefined) {
        key = 'name';
    } else if (firstRecord.label !== undefined) {
        key = 'label';
    }
    return key;
};