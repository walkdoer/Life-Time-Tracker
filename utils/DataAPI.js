var server = require('../conf/config').server;
var ServerAction = require('../actions/ServerAction');
var Q = require('q');

module.exports = {

    getProjects: function (query) {
        return get('/api/projects', query).then(function (res) {
            ServerAction.receiveProjects(res);
        });
    },

    backUpLogFile: function (date, content) {
        return post('/api/backUpLogFile', {date: date, content: content});
    },

    /**
     * get calendar data
     * @param  {String} calType calendar type
     * @param  {Object} params  start, end
     * @return {Promise}
     */
    calendar: function (calType, params) {
        return get('/api/calendars/' + calType, params);
    }
};


function get(path, query) {
    var deferred = Q.defer();
    var url = server + path;
    $.get(url, query)
     .done(function (res) {
        deferred.resolve(res);
     }).fail(function (err) {
        console.error(err.stack);
        deferred.reject(err);
     });

    return deferred.promise;
}

function post(path, data) {
    var deferred = Q.defer();
    var url = server + path;
    $.post(url, data)
     .done(function (res) {
        deferred.resolve(res);
     }).fail(function (err) {
        console.error(err.stack);
        deferred.reject(err);
     });

    return deferred.promise;
}