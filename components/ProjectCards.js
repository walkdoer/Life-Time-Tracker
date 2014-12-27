/**
 * @jsx React.DOM
 */

var React = require('react');
var ProjectCard = require('./Project/ProjectCard');


var ProjectCards = React.createClass({


    render: function () {
        var loadingMsg;
        var projectCards =  this.props.projects.map(function (project) {
            return (<ProjectCard data={project} key={project._id}/>);
        });

        return (
            <div className="ltt_c-page-projects-projectCards" style={this.props.style}>
                {projectCards}
            </div>
        );
    }

});

module.exports = ProjectCards;
