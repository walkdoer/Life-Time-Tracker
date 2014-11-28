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
        var params = this.getParams();
        var reportId = params.reportId;
        if (!reportId) {
            //default report is overview
            this.replaceWith('/reports/overview');
            reportId = 'overview';
        }
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
            key: 'tag',
            path: '/reports/tag',
            icon: 'fa fa-tag'
        }, {
            text: 'Project',
            key: 'project',
            path: '/reports/project',
            icon: 'fa fa-rocket'
        }];

        var initialMenuItem = menuItems.filter(function(menu) {
            return menu.key === reportId;
        })[0];
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
