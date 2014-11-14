/**
 * @jsx React.DOM
 */

var React = require('react');
var Menu = require('./Menu');
var Logo = require('./Logo');
var _ = require('lodash');

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
        } /*{
            text: 'Projects',
            key: 'projects',
            icon: 'fa fa-rocket'
        }*/];
        //var isActive = this.isActive(this.props.to, this.props.params, this.props.query);
        return (
            <nav className="ltt_c-nav">
                <Logo />
                <Menu
                    items={items}
                    active={this.props.initialMenuItem}
                    onMenuClick={this.onMenuClick}
                />
            </nav>
        );
    },

    onMenuClick: function (menuItem) {
        if (_.isFunction(this.props.onMenuClick)) {
            this.props.onMenuClick(menuItem);
        };
    }

});

module.exports = Sidebar;
