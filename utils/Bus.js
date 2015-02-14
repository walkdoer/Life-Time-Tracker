var extend = require('extend');
var EventEmitter = require('events').EventEmitter;


module.exports = extend({}, EventEmitter.prototype);