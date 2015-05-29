var AppDispatcher = require('../dispatcher/AppDispatcher');
var GoalConstant = require('../constants/GoalConstant');
var DataAPI = require('../utils/DataAPI');



module.exports = {

    load: function (params) {
        var that = this;
        AppDispatcher.handleViewAction({
            type: GoalConstant.LOAD,
            params: params
        });
        DataAPI.Goal.load(params).then(function (goals) {
            that.loadSuccess(goals);
        }).fail(function (err) {
            that.loadError(err);
        });
    },

    loadSuccess: function (goals) {
        AppDispatcher.handleViewAction({
            type: GoalConstant.LOAD_SUCCESS,
            goals: goals
        });
    },

    loadError: function (err) {
        AppDispatcher.handleViewAction({
            type: GoalConstant.LOAD_ERROR,
            error: err
        });
    },

    create: function(goal) {
        AppDispatcher.handleViewAction({
            type: GoalConstant.CREATE,
            goal: goal
        });
        DataAPI.Goal.create(goal).then(function (goal) {
            AppDispatcher.handleViewAction({
                type: GoalConstant.CREATE_SUCCESS,
                goal: goal
            });
        });
    },


    update: function (goal) {
        DataAPI.Goal.update(goal).then(function (goal) {
            AppDispatcher.handleViewAction({
                type: GoalConstant.UPDATE_SUCCESS,
                goal: goal
            });
        }).catch(function (err) {
            AppDispatcher.handleViewAction({
                type: GoalConstant.UPDATE_ERROR,
                error: err
            });
        });
    },

    /**
     * @param  {string} id The ID of the ToDo item
     * @param  {string} text
     */
    updateText: function(id, text) {
        AppDispatcher.handleViewAction({
            type: GoalConstant.UPDATE_TEXT,
            id: id,
            text: text
        });

    },

    /**
     * @param  {string} id
     */
    destroy: function(goal) {
        DataAPI.Goal.destroy(goal).then(function (goal){
            AppDispatcher.handleViewAction({
                type: GoalConstant.DESTROY_SUCCESS,
                goal: goal
            });
        }).catch(function (err) {
            AppDispatcher.handleViewAction({
                type: GoalConstant.DESTROY_ERROR,
                error: err
            });
        });
    }

};