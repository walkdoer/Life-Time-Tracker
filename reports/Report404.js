/**
 * @jsx React.DOM
 */

var React = require('react');

var Report404 = React.createClass({

    render: function () {
        return (
            <div className="ltt_c-page ltt_c-page-404">
                <p className="ltt_c-page-404-title">404</p>
                <p className="ltt_c-page-404-message">The Report is not Exist.</p>
            </div>
        );
    }

});

module.exports = Report404;
