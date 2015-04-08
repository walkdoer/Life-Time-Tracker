var AppDispatcher = require('../dispatcher/AppDispatcher');
var EventEmitter = require('events').EventEmitter;
var _ = require('lodash');
var GoalConstant = require('../constants/GoalConstant');
var CHANGE_EVENT = 'change';

var Store = _.extend(EventEmitter.prototype, {
    loaded: false,
    creating: false,
    createSuccess: true,
    goals: [],
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
    var text, goal;

    switch (action.type) {
        case GoalConstant.LOAD:
            Store.loaded = false;
            break;

        case GoalConstant.LOAD_SUCCESS:
            Store.loaded = true;
            Store.goals = action.goals;
            break;

        case GoalConstant.LOAD_ERROR:
            Store.loaded = true;
            Store.loadError = action.error;
            break;
        case GoalConstant.CREATE:
            Store.creating = true;
            Store.createSuccess = false;
            break;
        case GoalConstant.CREATE_SUCCESS:
            Store.creating = false;
            Store.createSuccess = true;
            goal = action.goal;
            Store.goals.push(goal);
            break;

        case GoalConstant.CREATE_ERROR:
            Store.creating = false;
            Store.createError = action.error;
            break;

        case GoalConstant.UPDATE_TEXT:
            text = action.text.trim();
            if (text !== '') {
                update(action.id, text);
            }
            break;

        case GoalConstant.DESTROY:
            destroy({
                id: action.id
            });
        default:
            //do nothing
    }
    Store.emitChange();
    return true;
});


module.exports = Store;