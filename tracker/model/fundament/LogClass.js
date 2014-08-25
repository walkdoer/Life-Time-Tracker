/**
 * Log Class
 *
 * example:
 * var sportClass = new LogClass({
 *     name: '体育',
 *     code: 'SPR'
 * });
 */
'use strict';

var LogClass = function (config) {
    //class name;
    this.name = config.name;
    //class code;
    this.code = config.code;
};


module.exports = LogClass;
