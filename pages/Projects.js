/**
 * @jsx React.DOM
 */

var React = require('react');
var Q = require('q');
var Router = require('react-router');
var RouteHandler = Router.RouteHandler;
var Moment = require('moment');
var _ = require('lodash');
var swal = require('sweetalert');
var Mt = window.Mousetrap;
var Isotope = require("isotope-layout");
/*components*/
var DateRangePicker = require('../components/DateRangePicker');
var Pinyin = require('../components/Pinyin');
var ProjectCard = require('../components/Project/ProjectCard');
var Notify = require('../components/Notify');
var DataAPI = require('../utils/DataAPI');
var LoadingMask = require('../components/LoadingMask');
var pinyin = new Pinyin();

/** Utils */
var Bus = require('../utils/Bus');
var DataAPI = require('../utils/DataAPI');

/** Constants */
var EVENT = require('../constants/EventConstant');


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
        var that = this;
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

        return (
            <section className="ltt_c-page ltt_c-page-projects">
                <div className="ltt_c-page-projects-projectCards" style={projectCardsStyle}>
                    <div className="ltt_c-page-projects-filter">
                        <DateRangePicker ref="dateRange" start={this.state.startDate} end={this.state.endDate}
                            onDateRangeChange={this.onDateRangeChange}/>
                        <input ref="nameInput" type="text" placeholder="Filter with project name"
                            className="ltt_c-page-projects-filter-name"
                            onChange={function(e) {
                                var text = e.target.value;
                                this.filterProject(text);
                            }.bind(this)}/>
                    </div>
                    <div className="ltt_c-page-projects-projectCards" style={this.props.style} ref="projectCards">
                        <LoadingMask loaded={!this.state.loading}/>
                        {this.state.projects.map(function (project) {
                            return (
                                <ProjectCard
                                    startDate={that.state.startDate}
                                    endDate={that.state.endDate}
                                    data={project} key={project._id}
                                    onDelete={function (project, e) {
                                        if (window.confirm("Are you sure to delete")) {
                                            this.deleteProject(project);
                                        }
                                    }.bind(that, project)}/>
                                );
                        })}
                    </div>
                </div>
                <RouteHandler/>
            </section>
        );
    },

    initGrid: function () {
        var grid = this.refs.projectCards.getDOMNode();
        this.iso = new Isotope(grid, {
            itemSelector: '.ltt_c-projectCard'
        });
    },

    filterProject: function (text) {
        var allProjects = this.allProjects;
        text = text.trim();
        this.iso.arrange({
            filter: function (index, itemElement) {
                var project;
                var projectId = itemElement.dataset.id;
                if (!projectId) {return false;}
                allProjects.some(function (item) {
                    if (projectId === item._id) {
                        project = item;
                        return true;
                    }
                    return false;
                });
                if (!project) { return false; }
                var name = project.name;
                var py = pinyin.getCamelChars(name).toLowerCase();
                var fullPy = pinyin.getFullChars(name).toLowerCase();
                var tags = project.tags || [];
                var matchTag = tags.some(function (tag) {
                    var tagPy = pinyin.getCamelChars(tag).toLowerCase();
                    var tagFullPy = pinyin.getFullChars(tag).toLowerCase();
                    return tag.indexOf(text) >= 0 || tagFullPy.indexOf(text) >= 0 || tagPy.indexOf(text) >= 0;
                });
                var matchClass = (project.classes || []).some(function (cls) {
                    var upperCode = cls.toUpperCase();
                    var upperText = text.toUpperCase();
                    return upperCode.indexOf(upperText) >= 0;
                });
                return name.indexOf(text) >= 0 || fullPy.indexOf(text) >= 0 || py.indexOf(text) >= 0 || matchTag || matchClass;
            }
        });
    },

    isIndex: function () {
        return this.isActive('projectManage');
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
        DataAPI.Project.load({
            start: this.state.startDate,
            end: this.state.endDate
        }).then(function (projects) {
            that.allProjects = projects;
            that.setState({
                loading: false,
                projects: projects
            }, function () {
                this.initGrid();
            });
        }).fail(function (err) {
            console.error(err.stack);
        });
    },

    deleteProject: function (project) {
        var that = this;
        return DataAPI.deleteProject(project)
            .then(function (result) {
                that.loadProjects();
                var msg = _.template('Remove: Version(<%=removeVersionCount%>) Task(<%=removeTaskCount%>)')(result);
                Bus.emit(EVENT.UPDATE_APP_INFO);
                Notify.success(msg);
            }).fail(function (err) {
                Notify.error('delete fail ' + err.message);
            });
    }

});

module.exports = Projects;
