/**
 * @jsx React.DOM
 */

var React = require('react');
var Q = require('q');
var Router = require('react-router');
var RouteHandler = Router.RouteHandler;




var Projects = React.createClass({
    mixins: [Router.State],
    render: function () {
        return (
            <section className="ltt_c-page ltt_c-page-projects">
                <RouteHandler/>
            </section>
        );
    }

});

module.exports = Projects;
