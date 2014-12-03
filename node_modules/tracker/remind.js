'use strict';

var MODULE_PREFIX = './reminders/';
exports.get = function(type, options) {
    var watcherModuleName =  MODULE_PREFIX + type + 'Reminder';
    try {
        var Reminder = require(watcherModuleName);
        return new Reminder(options);
    } catch(e) {
        return null;
    }
};
