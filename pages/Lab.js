/**
 * @jsx React.DOM
 */

var React = require('react');
var Router = require('react-router');
var Link = Router.Link;
var RouteHandler=Router.RouteHandler;

module.exports = React.createClass({

    render: function () {
        return (
            <div className="ltt_c-page ltt_c-page-Lab">
                <ul className="ltt_c-page-Lab-sidebar">
                    <li><Link to="/lab/report/pie">多日Pie图</Link></li>
                    <li><Link to="/lab/report/lifeClass">生活Class图</Link></li>
                    <li><Link to="/lab/report/sunburst">Sunburst图</Link></li>
                </ul>
                <div className="ltt_c-page-Lab-content">
                    <RouteHandler/>
                </div>
            </div>
        );
    }

});
