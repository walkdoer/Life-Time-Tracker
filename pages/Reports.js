/**
 * @jsx React.DOM
 */

var React = require('react');
var DateRangePicker = require('../components/DateRangePicker');
var Moment = require('moment');
var Q = require('q');
var _ = require('lodash');
var Router = require('react-router');
var RouteHandler = Router.RouteHandler;
var Sidebar = require('../components/Sidebar');
var Menu = require('../components/Menu');
/** const **/
var DATE_FORMAT = 'YYYY-MM-DD';

var Reports = React.createClass({
    mixins: [Router.State, Router.Navigation],
    render: function () {
        var defaultMenuIndex = 0;
        var menuItems = [{
            text: 'Overview',
            key: 'overview',
            path: '/reports/overview',
            icon: 'fa fa-area-chart'
        }, {
            text: 'Today',
            key: 'today',
            path: '/reports/today',
            icon: 'fa fa-sun-o'
        }, {
            text: 'Weekly',
            key: 'weekly',
            path: '/reports/weekly',
            icon: 'fa fa-calendar'
        }, {
            text: 'Tag',
            key: 'tags',
            path: '/reports/tags',
            icon: 'fa fa-tag'
        }, {
            text: 'Project',
            key: 'project',
            path: '/reports/projects',
            icon: 'fa fa-rocket'
        }, {
            text: 'Relationship',
            key: 'relation',
            path: '/reports/relationship',
            icon: 'fa fa-users'
        }, {
            text: 'Classes',
            key: 'classes',
            path: '/reports/classes',
            icon: 'fa fa-th-large'
        }, {
            text: 'Annual',
            key: 'annual',
            path: '/reports/annual',
            icon: 'fa fa-newspaper-o'
        }];

        var pathname = this.getPath();

        var initialMenuItem = menuItems.filter(function (menuItem) {
            return menuItem.path === pathname;
        })[0];

        if (!initialMenuItem) {
            initialMenuItem = menuItems[defaultMenuIndex];
        }

        return (
            <section className="ltt_c-page ltt_c-page-reports">
                <Sidebar ref="sidebar">
                    <Menu items={menuItems} activeKey={initialMenuItem.key}/>
                </Sidebar>
                <RouteHandler className="ltt_c-page-reports-report"/>
            </section>
        );
    }

});

module.exports = Reports;
