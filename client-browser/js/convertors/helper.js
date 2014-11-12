/**
* convertor helper
*/
'use strict';
exports.getValueKey = function (rawData) {
    var valueKey, firstRecord = rawData[0];
    if (firstRecord.time !== undefined) {
        valueKey = 'time';
    } else if (firstRecord.count !== undefined) {
        valueKey = 'count';
    }
    return valueKey;
};
