/**
 * @jsx React.DOM
 */

var React = require('react');
var Q = require('q');
var Router = require('react-router');
var RouteHandler = Router.RouteHandler;
var Moment = require('moment');

/*components*/
var ProjectCards = require('../components/ProjectCards');
var remoteStorage = require('../components/storage.remote');
var DateRangePicker = require('../components/DateRangePicker');

var Projects = React.createClass({
    mixins: [Router.State],

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
        var projectCards, loadingMsg,
            isIndex = this.isIndex();
        if (isIndex) {
            if (this.state.loading) {
                loadingMsg = (
                    <div className="text-center">
                        <i className="fa fa-spinner fa-spin"></i>
                        loading projects
                    </div>
                );
            }
        }
        var projectCardsStyle = {
            display: isIndex ? 'block' : 'none'
        };
        projectCards = (<ProjectCards projects={this.state.projects} ref="projectCards" style={projectCardsStyle}/>);
        return (
            <section className="ltt_c-page ltt_c-page-projects">
                <DateRangePicker ref="dateRange" start={this.state.startDate} end={this.state.endDate}
                    onDateRangeChange={this.onDateRangeChange}/>
                {loadingMsg}
                {projectCards}
                <RouteHandler/>
            </section>
        );
    },

    isIndex: function () {
        return this.isActive('projectIndex');
    },

    componentDidMount: function () {
        this.loadProjects();
    },

    onDateRangeChange: function (start, end) {
        this.setState({
            startDate: start,
            endDate: end
        });
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
    }

});

module.exports = Projects;
