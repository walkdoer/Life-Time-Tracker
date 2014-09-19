'use strict';

var MODULE_PREFIX = './watchers/';
exports.get = function(type, options) {
    var watcherModuleName =  MODULE_PREFIX + type + 'Watcher';
    try {
        var Watch = require(watcherModuleName);
        return new Watch(options);
    } catch(e) {
        return null;
    }
};
