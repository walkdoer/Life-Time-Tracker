var AppDispatcher = require('../dispatcher/AppDispatcher');
var EventEmitter = require('events').EventEmitter;
var _ = require('lodash');
var AffectConstant = require('../constants/AffectConstant');
var CHANGE_EVENT = 'change';

var Store = _.extend({}, EventEmitter.prototype, {
    loaded: false,
    creating: false,
    positiveAffects: [],
    negativeAffects: [],
    emitChange: function() {
        this.emit(CHANGE_EVENT);
    },

    addChangeListener: function(callback) {
        this.on(CHANGE_EVENT, callback);
    },

    removeChangeListener: function(callback) {
        this.removeListener(CHANGE_EVENT, callback);
    }
});


AppDispatcher.register(function(payload) {
    var action = payload.action;
    var text, affect;

    switch (action.type) {
        case AffectConstant.LOAD:
            Store.loaded = false;
            break;

        case AffectConstant.LOAD_SUCCESS:
            Store.loaded = true;
            var affects = action.affects;
            Store.positiveAffects = affects.P ? affects.P : [];
            Store.negativeAffects = affects.N ? affects.N : [];
            break;

        case AffectConstant.LOAD_ERROR:
            Store.loaded = true;
            Store.loadError = action.error;
            break;
        case AffectConstant.CREATE:
            Store.creating = true;
            break;
        case AffectConstant.CREATE_SUCCESS:
            Store.creating = false;
            affect = action.affect;
            if (affect.type === 'P') {
                Store.positiveAffects.push(affect);
            } else if (affect.type === 'N') {
                Store.negativeAffects.push(affect);
            }
            break;

        case AffectConstant.CREATE_ERROR:
            Store.creating = false;
            Store.createError = action.error;
            break;

        case AffectConstant.UPDATE_TEXT:
            text = action.text.trim();
            if (text !== '') {
                update(action.id, text);
            }
            break;

        case AffectConstant.DESTROY:
            destroy({
                id: id
            });
        default:
            //do nothing
    }
    Store.emitChange();
    return true;
});


module.exports = Store;