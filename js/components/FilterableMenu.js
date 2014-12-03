/**
 * FilterableMenu
 * @jsx React.DOM
 */

var React = require('react');
var SearchBox = require('./SearchBox');
var Menu = require('./Menu');

var FilterableMenu = React.createClass({

    getDefaultProps: function () {
        return {
            initialMenuItem: 'Overview'
        };
    },

    render: function() {
        return (
            <div className="ltt_c-filterableMenu">
                <SearchBox placeholder="search here" />
                <Menu items={this.props.items} activeKey={this.props.activeKey}
                    onMenuClick={this.props.onMenuClick}/>
            </div>
        );
    }

});

module.exports = FilterableMenu;
