/**
 * filter sport logs
 */
'use strict';

var logClassEnum = require('../../../enum/logClass');

module.exports = function(log) {
    if (log.classes) {
        return log.classes.filter(function (cls) {
            return cls.code === logClassEnum.Sport;
        }).length > 0;
    }
    return false;
};

