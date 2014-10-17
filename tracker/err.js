
'use strict';
var errno = require('errno');


function getErr (err) {
    return errno.code[err.code];
}

exports.getErrDesc = function (err) {
    var e = getErr(err);
    if (e && e.description) {
        return e.description;
    } else {
        return 'unknow error';
    }
};


exports.getErr = getErr;
