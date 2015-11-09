'use strict';

var _memStore = {};

exports.set = function (key, val) {
    _memStore[key] = val;
};


exports.get = function (key) {
    return _memStore[key];
};


