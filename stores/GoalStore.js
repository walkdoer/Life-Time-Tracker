var AppDispatcher = require('../dispatcher/AppDispatcher');
var EventEmitter = require('events').EventEmitter;
var _ = require('lodash');
var GoalConstant = require('../constants/GoalConstant');
var CHANGE_EVENT = 'change';
var extend = require('extend');

var Store = _.extend({}, EventEmitter.prototype, {
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

function destroy(id) {
    var goalIndex = null;
    Store.goals.some(function (goal, index) {
        if (goal._id === id) {
            goalIndex = index;
        }
    });
    if (goalIndex !== null) {
        return Store.goals.splice(goalIndex, 1);
    }
}


AppDispatcher.register(function(payload) {
    var action = payload.action;
    var goal, result;

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

        case GoalConstant.DESTROY:
            destroy(action.goal._id);
            break;

        case GoalConstant.UPDATE_SUCCESS:
            result = action.goal;
            Store.updateSuccess = true;
            Store.updateGoal = result;
            Store.goals.some(function (goal) {
                if (goal._id === result._id) {
                    console.log('update', goal);
                    extend(goal, result);
                }
            });
            break;

        case GoalConstant.UPDATE_ERROR:
            Store.updateSuccess = false;
            break;
        default:
            //do nothing
    }
    Store.emitChange();
    return true;
});


module.exports = Store;