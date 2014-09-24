/**
 * calendar generator
 *
 * can be see as an entr for all calendar type
 */

'use strict';

exports.generate = function (options) {
    var calendarType = options.type,
        path = './calendars/',
        moduleName = calendarType.toLowerCase() + 'Calendar';
    var calendar = require(path + moduleName);
    return calendar.generate(options);
};
