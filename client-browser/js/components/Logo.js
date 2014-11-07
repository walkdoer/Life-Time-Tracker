/**
 * @jsx React.DOM
 */

var React = require('react');
var Logo = React.createClass({

    render: function () {
        return (
            <div className="ltt_c-logo">
                <i className="fa fa-angellist fa-5x"></i>
            </div>
        );
    }
});

module.exports = Logo;
