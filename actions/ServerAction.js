var AppDispatcher = require('../dispatcher/AppDispatcher');
var ProjectConstant = require('../constants/ProjectConstant');

module.exports = {

    receiveProjects: function (data) {
        AppDispatcher.handleServerAction({
            type: ProjectConstant.RECEIVE_PROJECTS,
            data: data
        });
    }
};