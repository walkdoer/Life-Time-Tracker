/**
 * @jsx React.DOM
 */

var React = require('react');

var Page404 = React.createClass({

    render: function () {
        return (
            <div className="ltt_c-page-404">
                <p className="ltt_c-page-404-title">404</p>
                <p className="ltt_c-page-404-message">The page is not Exist.0</p>
            </div>
        );
    }

});

module.exports = Page404;
