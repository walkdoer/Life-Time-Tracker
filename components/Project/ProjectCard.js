/**
 * @jsx React.DOM
 */



var React = require('react');
var cx = React.addons.classSet;
var Moment = require('moment');
require("moment-duration-format");
var Tag = require('../Tag');
var LogClass = require('../LogClass');
var _ = require('lodash');
var Router = require('react-router');
var Link = Router.Link;
var D3SimpleColumn = require('../charts/D3SimpleColumn.js');


var config = require('../../conf/config');
var DataAPI = require('../../utils/DataAPI');

var ProjectCard = React.createClass({

    getDefaultProps: function () {
        return {
            autoload: false
        };
    },

    getInitialState: function () {
        return {
            activityData: [],
            loaded: false
        };
    },

    componentDidMount: function () {
        if (this.props.autoload) {
            this._loadActivity(this.props);
        }
    },

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
                var taskPg = task.progress;
                return (
                    <li className="ltt_c-projectCard-task">
                        <i className="fa fa-angle-right"></i>
                        <Link to={href}>
                            <span className={cx({done: taskPg === 100})}>{task.name}</span>
                            {taskPg < 100 && taskPg >= 0 ? <span className="ltt_c-projectCard-task-progress">{taskPg + '%'}</span> : null}
                        </Link>
                    </li>
                );
            });
        }


        /* <p className="ltt_c-projectCard-logClasses">{logClasses}</p> */
        return (
            <div className={"ltt_c-projectCard " + (this.props.className || '')} data-id={projectData._id}>
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
                <D3SimpleColumn data={this.state.activityData}/>
                {this.getLogClassIndicators()}
            </div>
        );
    },

    getLogClassIndicators: function () {
        var logClasses = this.props.data.classes,
            indicators;
        var logClassesColors = {};
        config.classes.forEach(function (item) {
            logClassesColors[item._id] = item.color;
        });
        if (!_.isEmpty(logClasses)) {
            indicators = logClasses.map(function (cls) {
                var style = {
                    'backgroundColor': logClassesColors[cls]
                };
                return <i title={cls.name} style={style}></i>
            });
        }
        return (<p className="ltt_c-projectCard-logClassIndicators">{indicators}</p>);
    },

    loadActivity: function () {
        if (!this.state.loaded) {
            this._loadActivity(this.props);
        }
    },

    componentWillReceiveProps: function (nextProps) {
        if (this.props.autoload) {
            this._loadActivity(nextProps);
        }
    },

    _loadActivity: function (params) {
        var that = this;
        DataAPI.Log.load({
            sum: true,
            start: params.startDate,
            end: params.endDate,
            projects: params.data.name,
            group: 'date'
        }).then(function (data) {
            var dataLen = Moment(params.endDate).diff(params.startDate, 'day') + 1;
            var result = [];
            data.sort(function (a,b) {
                return (new Date(a._id).getTime() - new Date(b._id).getTime());
            }).forEach(function (d, index) {
                var diffStart = Moment(d._id).diff(params.startDate, 'day');
                var gap = diffStart - result.length;
                while(gap--) {
                    result.push(0);
                }
                result.push(d.totalTime);
                return d.totalTime;
            });
            var gap = dataLen - result.length;
            while(gap--) {
                result.push(0);
            }
            that.setState({
                activityData: result,
                loaded: true
            });
        });
    }

});

module.exports = ProjectCard;
