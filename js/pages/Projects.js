/**
 * @jsx React.DOM
 */

var React = require('react');
var ProjectCard = require('../components/Project/ProjectCard');
var remoteStorage = require('../components/storage.remote');

var Projects = React.createClass({

    getInitialState: function () {
        return {
            loading: true,
            projects: []
        };
    },

    render: function () {
        var loadingMsg;
        var projectCards =  this.state.projects.map(function (project) {
            return (<ProjectCard data={project} />);
        });

        if (this.state.loading) {
            loadingMsg = (<div className="text-center"><i className="fa fa-spinner fa-spin"></i> loading projects</div>);
        }
        return (
            <div className="ltt_c-page ltt_c-page-projects">
                {loadingMsg}
                <div className="ltt_c-page-projects-projectCards">
                    {projectCards}
                </div>
            </div>
        );
    },

    componentDidMount: function () {
        this.loadProjects();
    },

    loadProjects: function () {
        var that = this;
        this.setState({ loading: true });
        remoteStorage.get('/api/projects/2014')
            .then(function (results) {
                var projects = results.data;
                that.setState({
                    loading: false,
                    projects: projects
                });
            });
    }

});

module.exports = Projects;
