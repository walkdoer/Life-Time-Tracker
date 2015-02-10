/**
 * @jsx React.DOM
 */



var React = require('react');
var Moment = require('moment');
require("moment-duration-format");
var Tag = require('../Tag');
var LogClass = require('../LogClass');
var _ = require('lodash');
var Router = require('react-router');
var Link = Router.Link;

var LogClassColors = {
    NT: '#CCC',
    WK: '#84cbbc',
    SPR: '#fdc53b',
    STU: '#BAED86',
    TK: '#000',
    BRK: '#6D6C99'
};

var ProjectCard = React.createClass({

    render: function () {
        var projectData = this.props.data;
        var tags = projectData.tags,
            logClasses = projectData.classes;
        if (!_.isEmpty(tags)) {
            tags = tags.map(function (tag) {
                return (<Tag>{tag}</Tag>);
            });
        }
        var logClasses = logClasses.map(function(cls) {
            return (<LogClass data={cls}/>);
        });
        var versions = projectData.versions,
            lastVersion, lastVersionData;
        if (!_.isEmpty(versions)) {
            lastVersionData = projectData.versions[0];
            var linkVersionParams = {
                projectId: projectData._id,
                versionId: lastVersionData._id
            };
            lastVersion = (
                <span className="ltt_c-projectCard-lastVersion" title="version">
                    <i className="fa fa-sitemap" title="version"></i>
                    <Link to="projectVersionTask" params={linkVersionParams}>{lastVersionData.name}</Link>
                </span>
            )
        }
        var lastTasks;
        if (projectData.lastTasks) {
            lastTasks = projectData.lastTasks.map(function (task) {
                var href = '/projects/' + projectData._id;
                if (lastVersionData) {
                    href += '/versions/' + lastVersionData._id;
                }
                href += '/tasks/' + task._id;
                return (
                    <li className="ltt_c-projectCard-task">
                        <i className="fa fa-angle-right"></i>
                        <Link to={href}>{task.name}</Link>
                    </li>
                );
            });
        }


        /* <p className="ltt_c-projectCard-logClasses">{logClasses}</p> */
        return (
            <div className="ltt_c-projectCard">
                <h1>
                    <Link to={'/projects/' + projectData._id}>{projectData.name}</Link>
                    <span className="ltt_c-projectCard-delete" onClick={this.props.onDelete}><i className="fa fa-close" title="delete project"></i></span>
                </h1>
                <div>
                    <span className="ltt_c-projectCard-lastActiveTime">{new Moment(projectData.lastActiveTime).fromNow()}</span>
                    {lastVersion}
                </div>
                <p className="ltt_c-projectCard-tags ltt-tags">{tags}</p>
                <ul className="ltt_c-projectCard-tasks">{lastTasks}</ul>
                <p className="ltt_c-projectCard-footer">
                    <span className="ltt_c-projectCard-footer-item ltt_c-projectCard-footer-taskCount">
                        <i className="fa fa-tasks"></i> &times; {projectData.taskCount}
                    </span>
                    <span className="ltt_c-projectCard-footer-item ltt_c-projectCard-footer-totalTime">
                        <i className="fa fa-clock-o"></i>
                        {Moment.duration(projectData.totalTime, "minutes").format("M[m],d[d],h[h],mm[min]")}
                    </span>
                </p>
                {this.getLogClassIndicators()}
            </div>
        );
    },

    getLogClassIndicators: function () {
        var logClasses = this.props.data.classes,
            indicators;
        if (!_.isEmpty(logClasses)) {
            indicators = logClasses.map(function (cls) {
                var style = {
                    'background-color': LogClassColors[cls.code]
                };
                return <i title={cls.name} style={style}></i>
            });
        }
        return (<p className="ltt_c-projectCard-logClassIndicators">{indicators}</p>);
    }

});

module.exports = ProjectCard;
