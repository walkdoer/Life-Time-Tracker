/**
 * database connection
 */

'use strict';
var mongoose = require('mongoose'),
    when = require('when'),
    _ = require('lodash'),
    Msg = require('../message');
var conn = null;

module.exports = {
    connect: function () {
        var deferred = when.defer();
        //connect to lifeTimeTracker database
        mongoose.connect('mongodb://localhost/lifeTimeTracker');
        conn = mongoose.connection;

        conn.on('error', function (err) {
            Msg.error('Database connect error.');
            deferred.reject(err);
            throw err;
        });
        conn.once('open', function () {
            Msg.info('Database connect success.');
            deferred.resolve();
        });
        return deferred.promise;
    },

    reset: function () {
        _.pairs(mongoose.connection.collections).forEach(function (pair) {
            var name = pair[0],
                collection = pair[1];
            collection.drop( function(err) {
                if (err) {
                    if (err.errmsg === 'ns not found') {
                        Msg.info('collection ' + name + ' is not exists');
                    } else {
                        Msg.error('reset collection ' + name + ' failed', err);
                    }
                } else {
                    Msg.success(name + ' collection dropped');
                }
            });
        });
    },


    disconnect: function () {
        mongoose.disconnect();
    },

    conn: function () {
        return conn;
    }
};
