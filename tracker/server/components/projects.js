'use strict';

var Project = require('../../project');

exports.generate = function (options) {
    return Project.get(options);
};
