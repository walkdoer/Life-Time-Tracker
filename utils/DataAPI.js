var server = require('../conf/config').server;
var ServerAction = require('../actions/ServerAction');
var Q = require('q');

module.exports = {

    getProjects: function (query) {
        return get('/api/projects', query).then(function (res) {
            ServerAction.receiveProjects(res);
        });
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