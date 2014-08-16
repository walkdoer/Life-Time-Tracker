/**
 * database connection
 */

'use strict';
var mongoose = require('mongoose'),
    when = require('when'),
    msg = require('../message');
var conn = null;

module.exports = {
    connect: function () {
        var deferred = when.defer();
        //connect to lifeTimeTracker database
        mongoose.connect('mongodb://localhost/lifeTimeTracker');
        conn = mongoose.connection;

        conn.on('error', function (err) {
            msg.error('Database connect error.');
            deferred.reject(err);
        });
        conn.once('open', function () {
            msg.info('Database connect success.');
            deferred.resolve();
        });
        return deferred.promise;
    },


    disconnect: function () {
        mongoose.disconnect();
    },

    conn: function () {
        return conn;
    }
};
