/**
 * @jsx React.DOM
 */

var React = require('react');
var Menu = require('./Ltt.Menu');
var Logo = require('./Ltt.Logo');

var Sidebar = React.createClass({

    /**
     * @return {object}
     */
    render: function() {
        var items = [{
            text: 'Dashboard',
            key: 'dashboard',
            icon: 'fa fa-dashboard'
        }, {
            text: 'Reports',
            key: 'reports',
            icon: 'fa fa-bar-chart'
        }, {
            text: 'Logs',
            key: 'logs',
            icon: 'fa fa-file'
        }, {
            text: 'Projects',
            key: 'projects',
            icon: 'fa fa-rocket'
        }];
        return (
            <nav className="ltt_c-nav">
                <Logo />
                <Menu
                    items={items}
                    active="dashboard"
                    onMenuClick={this.onMenuClick}
                />
            </nav>
        );
    },

    onMenuClick: function (menuItem) {
        this.props.onMenuClick(menuItem);
    }

});

module.exports = Sidebar;
