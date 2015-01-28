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
var FilterableMenu = require('../components/FilterableMenu');
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
            text: 'Tag',
            key: 'tags',
            path: '/reports/tags',
            icon: 'fa fa-tag'
        }, {
            text: 'Project',
            key: 'project',
            path: '/reports/project',
            icon: 'fa fa-rocket'
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
                    <FilterableMenu items={menuItems}
                        activeKey={initialMenuItem.key}
                        onMenuClick={this.onMenuClick}
                    />
                </Sidebar>
                <RouteHandler className="ltt_c-page-reports-report"/>
            </section>
        );
    }

});

module.exports = Reports;
