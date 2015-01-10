/**
 * @jsx React.DOM
 */

var React = require('react');
var Logo = React.createClass({

    render: function () {
        return (
            <div className="ltt_c-logo">
                <span className="ltt_c-logo-title">{this.props.title}</span>
            </div>
        );
    }
});

module.exports = Logo;
