/**
 * @jsx React.DOM
 */

var React = require('react');
var MenuItem = require('./Menu.Item');
var Menu = React.createClass({

    render: function () {
        var currentMenuItem = this.props.activeKey;
        var menuItems = this.props.items;
        var menu = this;
        var onlyIcon;
        if (this.props.text === false) {
            onlyIcon = true;
        }
        menuItems = menuItems.map(function (item, i) {
            var active = item.key === currentMenuItem;
            var boundClick = this.handleClick.bind(this, item);
            return (<MenuItem
                active={active}
                menuKey={item.key}
                path={item.path}
                text={onlyIcon ? null : item.text}
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
        if (this.props.onMenuClick) {
            this.props.onMenuClick(menuItem);
        }
    }

});

module.exports = Menu;
