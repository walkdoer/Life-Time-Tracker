/**
 * @jsx React.DOM
 */

var React = require('react');
var MenuItem = require('./Ltt.Menu.Item');
var Menu = React.createClass({

    render: function () {
        var activeMenuKey = this.props.active;
        var menuItems = this.props.items;
        if (activeMenuKey) {
            menuItems.forEach(function (item) {
                item.active = item.key === activeMenuKey;
            });
        }
        menuItems = menuItems.map(function (item) {
            console.log(item);
            return (<MenuItem
                active={item.active}
                text={item.text}
                icon={item.icon}
                key={item.key}/>);
        });
        return (
            <ul className="ltt_c-menu">
                {menuItems}
            </ul>
        );
    }
});

module.exports = Menu;
