/**
 * stat helper
 * define the common function that use by the statists here.
 */
'use strict';


exports.getLogs = function (data) {
    var logArr = data.split('\n').filter(isEmpty);
    return logArr;
};

function isEmpty(val) {
    return !!val;
}
