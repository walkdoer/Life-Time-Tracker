'use strict';

var Tag = require('../../tag');

exports.generate = function (options) {
    return Tag.get(options);
};
