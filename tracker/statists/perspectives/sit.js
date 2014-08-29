/**
 * sit perspective
 *
 * see how many time I sit one day or one period,like one week or one month.
 */
'use strict';

var logClassEnum = require('../../enum/logClass');

exports.focus = function (options, scanResult) {
    var logs = scanResult.logs;

    logs.forEach(function (log) {
        if (isStandLog(log)) {
            console.log('');
        }
    });
};

function isStandLog(log) {
    var classes = log.classes,
        tags = log.tags;
    return hasLogClass(classes, logClassEnum.Sport) ||
        (hasLogClass(classes, logClassEnum.NormalThing) && hasTag(tags, '信息漫游'));
}


function hasLogClass(logClasses, targetCls) {
    return logClasses.filter(function (cls) {
        return cls.code === targetCls;
    }).length > 0;
}

function hasTag(tags, targetTag) {
    return tags.filter(function (tag) {
        return tag === targetTag;
    }).length > 0;
}
