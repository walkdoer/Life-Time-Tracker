/**
 * @jsx React.DOM
 */

var React = require('react');
var Router = require('react-router');
var Link = Router.Link;

module.exports = React.createClass({

    render: function () {
        return (
            <div className="ltt_c-page ltt_c-page-Lab">
                <h1>Lab</h1>
                <Link to="/lab/report/pie">多日Pie图</Link>
            </div>
        );
    }

});
