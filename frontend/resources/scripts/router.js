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
    var MonthReport = require('./components/pages/reports/monthReport');
    var DayReport = require('./components/pages/reports/dayReport');
    var YearReport = require('./components/pages/reports/yearReport');
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
            },
            'reports(/:year)(/:month)(/:day)': function(year, month, day) {
                var Report = null;
                if (year && month && day) {
                    Report = DayReport;
                } else if (year && month) {
                    Report = MonthReport;
                } else if (year){
                    Report = YearReport;
                }
                React.renderComponent(Report({
                    options: {
                        year: year,
                        month: month,
                        day: day
                    }
                }), $('.container')[0]);
            },
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
