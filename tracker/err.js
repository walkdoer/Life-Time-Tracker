
'use strict';
var errno = require('errno');
var _ = require('lodash');


function getErr (err) {
    return errno.code[err.code];
}

function getErrDesc(err) {
    var e = getErr(err);
    if (e && e.description) {
        return e.description;
    } else {
        return 'unknow error';
    }
}

function serverErr(e) {
    var prefix = 'Server Error';
    var title;
    if (_.isString(e)) {
        title = e;
    } else {
        title = getErrDesc(e);
    }
    var msg = prefix + ' : ' + title;
    return {
        msg: msg
    };
}
exports.serverErr = serverErr;
exports.getErrDesc = getErrDesc;


exports.getErr = getErr;
