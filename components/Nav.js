/**
 * @jsx React.DOM
 */

var React = require('react');
var Menu = require('./Menu');
var Logo = require('./Logo');
var _ = require('lodash');

var Nav = React.createClass({


    /**
     * @return {object}
     */
    render: function() {
        var items = [{
            text: 'Dashboard',
            key: 'dashboard',
            path: 'dashboard',
            icon: 'fa fa-dashboard'
        }, {
            text: 'Reports',
            key: 'reports',
            path: 'reports',
            icon: 'fa fa-bar-chart'
        }, {
            text: 'Logs',
            key: 'logs',
            path: 'logs',
            icon: 'fa fa-file'
        }, {
            text: 'Projects',
            key: 'projects',
            path: 'projects',
            icon: 'fa fa-rocket'
        }, {
            text: "Editor",
            key: "logEditor",
            path: "logEditor",
            icon: "fa fa-edit"
        }];
        //var isActive = this.isActive(this.props.to, this.props.params, this.props.query);
        return (
            <nav className="ltt_c-nav">
                <Menu
                    items={items}
                    activeKey={this.props.initialMenuItem}
                    text={false} //only icon
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

module.exports = Nav;
