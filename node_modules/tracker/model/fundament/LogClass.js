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

var LogClass = function (name, code) {
    //class name;
    this.name = name;
    //class code;
    this.code = code;
};


module.exports = LogClass;
