var server = require('../conf/config').server;
var ServerAction = require('../actions/ServerAction');
var Q = require('q');
var isNodeWebkit = true;

try {
    var a = global.process.version;
} catch (err) {
    isNodeWebkit = false;
}


function url(src) {
    if (isNodeWebkit) {
        return 'http://localhost:3333' + src;
    } else {
        return server + '/api' + src;
    }
}


module.exports = {

    getAppInfo: function () {
        return get(url('/appInfo')).then(function (res) {
            return res;
        });
    },

    getProjects: function (query) {
        return get(url('/projects'), query).then(function (res) {
            ServerAction.receiveProjects(res);
        });
    },

    backUpLogFile: function (date, content) {
        return post(url('/backUpLogFile'), {date: date, content: content});
    },

    /**
     * get calendar data
     * @param  {String} calType calendar type
     * @param  {Object} params  start, end
     * @return {Promise}
     */
    calendar: function (calType, params) {
        return get(url('/calendars/' + calType), params);
    },

    deleteProject: function (project) {
        var deferred = Q.defer();
        $.ajax({
            type:'delete',
            url: url('/projects/' + project._id),
            success: function (result) {
                deferred.resolve(result);
            },
            error: function (err) {
                deferred.reject(err);
            }
        });
        return deferred.promise;
    }
};


function get(url, query) {
    var deferred = Q.defer();
    $.get(url, query)
     .done(function (res) {
        deferred.resolve(res);
     }).fail(function (err) {
        console.error(err.stack);
        deferred.reject(err);
     });

    return deferred.promise;
}

function post(url, data) {
    var deferred = Q.defer();
    $.post(url, data)
     .done(function (res) {
        deferred.resolve(res);
     }).fail(function (err) {
        console.error(err.stack);
        deferred.reject(err);
     });

    return deferred.promise;
}