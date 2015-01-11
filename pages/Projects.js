/**
 * @jsx React.DOM
 */

var React = require('react');
var Q = require('q');
var Router = require('react-router');
var RouteHandler = Router.RouteHandler;
var Moment = require('moment');
var _ = require('lodash');
var Mt = window.Mousetrap;
/*components*/
var ProjectCards = require('../components/ProjectCards');
var remoteStorage = require('../components/storage.remote');
var DateRangePicker = require('../components/DateRangePicker');
var Pinyin = require('../components/Pinyin');


var Projects = React.createClass({
    mixins: [Router.State],

    getInitialState: function () {
        var startDate = new Moment().startOf('month').toDate(),
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
        projectCards = (<ProjectCards projects={this.state.projects} ref="projectCards"/>);
        return (
            <section className="ltt_c-page ltt_c-page-projects">
                <div className="ltt_c-page-projects-projectCards" style={projectCardsStyle}>
                    <div className="ltt_c-page-projects-filter">
                        <DateRangePicker ref="dateRange" start={this.state.startDate} end={this.state.endDate}
                            onDateRangeChange={_.debounce(this.onDateRangeChange, 200)}/>
                        <input ref="nameInput" type="text" placeholder="Filter with project name" className="ltt_c-page-projects-filter-name" onChange={this.filterProject}/>
                    </div>
                    {loadingMsg}
                    {projectCards}
                </div>
                <RouteHandler/>
            </section>
        );
    },

    isIndex: function () {
        return this.isActive('projectIndex');
    },

    componentDidMount: function () {
        this.loadProjects();
        var input = this.refs.nameInput;
        Mt.bind('command+f', function (e) {
            e.preventDefault();
            var $input = $(input.getDOMNode());
            $input.focus();
        });
    },

    componentWillUnmount: function () {
        Mt.unbind('command+f');
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
                that.allProjects = projects;
                that.setState({
                    loading: false,
                    projects: projects
                });
            });
    },

    filterProject: function (e) {
        var pinyin = new Pinyin();
        var text = e.target.value;
        text = text.trim();
        var result = [];
        result = this.allProjects.filter(function (project) {
            var name = project.name;
            var py = pinyin.getCamelChars(name).toLowerCase();
            var fullPy = pinyin.getFullChars(name).toLowerCase();
            return name.indexOf(text) >= 0 || fullPy.indexOf(text) >= 0 || py.indexOf(text) >= 0;
        });
        this.setState({
            projects: result
        });
    }

});

module.exports = Projects;
