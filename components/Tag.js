/**
 * @jsx React.DOM
 */

var React = require('react');
var Tag = React.createClass({
    displayName: 'tag',
    render: function () {
        return (
            <span className="ltt_c-tag"><i className="fa fa-tag"></i>{this.props.children}</span>
        );
    }
});

module.exports = Tag;
