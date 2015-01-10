/**
 * Sidebar
 * @jsx React.DOM
 */

var React = require('react');

var Sidebar = React.createClass({

    getDefaultProps: function () {
        return {
            initialMenuItem: 'Overview'
        };
    },

    render: function() {
        return (
            <div className="ltt_c-sidebar">
                {this.props.children}
            </div>
        );
    }
});

module.exports = Sidebar;
