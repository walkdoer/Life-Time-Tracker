/**
 * @jsx React.DOM
 */

var React = require('react');
var MenuItem = require('./Menu.Item');
var Menu = React.createClass({

    getInitialState: function () {
        return {
            currentMenuItem: this.props.active
        };
    },

    render: function () {
        var currentMenuItem = this.state.currentMenuItem;
        var menuItems = this.props.items;
        var menu = this;
        menuItems = menuItems.map(function (item, i) {
            var active = item.key === currentMenuItem;
            var boundClick = this.handleClick.bind(this, item);
            return (<MenuItem
                active={active}
                menuKey={item.key}
                text={item.text}
                icon={item.icon}
                onClick={boundClick}
                key={item.key}/>);
        }, this);
        return (
            <ul className="ltt_c-menu">
                {menuItems}
            </ul>
        );
    },

    handleClick: function (menuItem) {
        this.setState({
            currentMenuItem: menuItem.key
        });
        this.props.onMenuClick(menuItem);
    }

});

module.exports = Menu;
