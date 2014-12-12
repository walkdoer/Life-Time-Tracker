/**
 * @jsx React.DOM
 */

var React = require('react');
var ProjectCard = require('../components/Project/ProjectCard');
var remoteStorage = require('../components/storage.remote');
var Moment = require('moment');
var DateRangePicker = require('../components/DateRangePicker');

var Projects = React.createClass({

    getInitialState: function () {
        var startDate = new Moment('2014-08-01').toDate(),
            endDate = new Moment().endOf('day').toDate();
        return {
            loading: true,
            startDate: startDate,
            endDate: endDate,
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
                <DateRangePicker ref="dateRange" start={this.state.startDate} end={this.state.endDate}
                    onDateRangeChange={this.onDateRangeChange}/>
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
        remoteStorage.get('/api/projects', {
            start: this.state.startDate,
            end: this.state.endDate
        }).then(function (results) {
                var projects = results.data;
                that.setState({
                    loading: false,
                    projects: projects
                });
            });
    },

    onDateRangeChange: function (start, end) {
        this.setState({
            startDate: start,
            endDate: end
        });
        this.loadProjects();
    }

});

module.exports = Projects;
