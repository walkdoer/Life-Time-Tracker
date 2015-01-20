var AppDispatcher = require('../dispatcher/AppDispatcher');
var EventEmitter = require('events').EventEmitter;
var _ = require('lodash');
var ProjectConstant = require('../constants/ProjectConstant');
var StoreBase = require('./StoreBase');

var Store = _.extend({}, EventEmitter.prototype, StoreBase).init();


AppDispatcher.register(function (payload) {
    var action = payload.action;

    switch (action.type) {
        case ProjectConstant.RECEIVE_PROJECTS:
            Store.setData(action.data);
            break;
        default:
            //do nothing
    }
    return true;
});


module.exports = Store;