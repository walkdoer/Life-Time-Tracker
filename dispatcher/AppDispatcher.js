/**
 * App Dispatcher
 */

var Dispatcher = require('flux').Dispatcher;
var _ = require('lodash');


var AppDispatcher = _.extend(new Dispatcher(), {

    /**
     * @param  {object} action The data coming from the view.
     */
    handleViewAction: function(action) {
        this.dispatch({
            source: 'VIEW_ACTION',
            action: action
        });
    },


    /**
     * @param  {object} action The data coming from the server.
     */
    handleServerAction: function (action) {
        this.dispatch({
            source: 'SERVER_ACTION',
            action: action
        });
    }
});

module.exports = AppDispatcher;