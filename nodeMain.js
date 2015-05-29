(function () {
    'use strict';
    var EventEmitter = require('events').EventEmitter;
    var extend = require('extend');
    var main = extend({
        serverStarted: function (success) {
            if (success) {
                this.emit('start');
            } else {
                this.emit('error');
            }
        }
    }, EventEmitter.prototype);
    exports.server = main;
})();