/**
 * @jsx React.DOM
 */

var React = require('react');

var ProjectCard = React.createClass({

    render: function () {
        var projectData = this.props.data;
        return (
            <div className="ltt_c-projectCard">
                <h1>{projectData.name}</h1>
            </div>
        );
    }

});

module.exports = ProjectCard;
