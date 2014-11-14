/**
 * @jsx React.DOM
 */

var React = require('react');
var $ = require('jquery');
var addons = require('react/addons').addons;
var Router = require('react-router');
var Link = Router.Link;
var MenuItem = React.createClass({

    /**
     * @return {object}
     */
    render: function() {
        var cx = addons.classSet;
        var className = cx({
            'ltt_c-menu-item': true,
            'active': this.props.active
        });
        return (
            <li className={className} onClick={this.handleClick}>
                <i className={this.props.icon}></i>
                <Link to={this.props.menuKey}>
                    {this.props.text}
                </Link>
            </li>
        );
    },


    handleClick: function (menuItem) {
        this.props.onClick(menuItem);
    }

});

module.exports = MenuItem;