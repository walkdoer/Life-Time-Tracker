/**
 * Application Router
 */
define(function(require) {
    'use strict';
    var Backbone = require('Backbone');

    var React = require('react');
    var dashboard = require('./components/pages/dashboard/dashboard');
    var Log = require('./components/pages/logs/logs');
    var Router = Backbone.Router.extend({
        routes: {
            'dashboard': function() {
                dashboard.initialize();
            },
            'logs': function() {
                var start = new Date().getTime();
                setInterval(function() {
                    React.renderComponent(
                        Log({
                            elapsed: new Date().getTime() - start
                        }),
                        document.body
                    );
                }, 50);
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
