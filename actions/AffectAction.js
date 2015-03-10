var AppDispatcher = require('../dispatcher/AppDispatcher');
var AffectConstant = require('../constants/AffectConstant');
var DataAPI = require('../utils/DataAPI');

module.exports = {

    load: function (params) {
        var that = this;
        AppDispatcher.handleViewAction({
            type: AffectConstant.LOAD,
            params: params
        });
        DataAPI.Affect.load(params).then(function (affects) {
            that.loadSuccess(affects);
        }).fail(function (err) {
            that.loadError(err);
        });
    },

    loadSuccess: function (affects) {
        AppDispatcher.handleViewAction({
            type: AffectConstant.LOAD_SUCCESS,
            affects: affects
        });
    },

    loadError: function (err) {
        AppDispatcher.handleViewAction({
            type: AffectConstant.LOAD_ERROR,
            error: err
        });
    },

    create: function(affect) {
        AppDispatcher.handleViewAction({
            type: AffectConstant.CREATE,
            affect: affect
        });
        DataAPI.Affect.create(affect).then(function (affect) {
            AppDispatcher.handleViewAction({
                type: AffectConstant.CREATE_SUCCESS,
                affect: affect
            });
        });
    },

    /**
     * @param  {string} id The ID of the ToDo item
     * @param  {string} text
     */
    updateText: function(id, text) {
        AppDispatcher.handleViewAction({
            type: AffectConstant.UPDATE_TEXT,
            id: id,
            text: text
        });

    },

    /**
     * @param  {string} id
     */
    destroy: function(id) {
        AppDispatcher.handleViewAction({
            type: AffectConstant.DESTROY,
            id: id
        });
    }

};