/**
 * Application Router
 */
define(function(require) {
    'use strict';
    var Backbone = require('Backbone');

    var React = require('react');
    var Dashboard = require('./components/pages/dashboard/dashboard.r');
    var Logs = require('./components/pages/logs/logs');
    var remoteStorage = require('./components/storage.remote');
    var container = $('.container')[0];
    var Router = Backbone.Router.extend({
        routes: {
            'dashboard': function() {
                React.renderComponent(Dashboard(), container);
            },
            'logs(/:year)(/:month)(/:day)': function(year, month, day) {
                var date = [year, month, day].filter(function (val) {
                    return !!val;
                }).join('/');
                remoteStorage.get('/api/logs/' + date)
                    .then(function (result) {
                        var logs = result.data;
                        React.renderComponent(Logs({
                            logs: logs
                        }), $('.container')[0]);
                    });
            }
        },
        start: function() {
            Backbone.history.start({
                pushState: true
            });
            return this;
        }
    });

    return new Router();
});
