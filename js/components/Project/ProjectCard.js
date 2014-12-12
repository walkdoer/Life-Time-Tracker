/**
 * @jsx React.DOM
 */

var React = require('react');
var Moment = require('moment');
var Tag = require('../Tag');
var LogClass = require('../LogClass');
var _ = require('lodash');
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
        return (
            <div className="ltt_c-projectCard">
                <h1>{projectData.name}</h1>
                <p className="ltt_c-projectCard-tags">{tags}</p>
                <p className="ltt_c-projectCard-logClasses">{logClasses}</p>
                <p className="ltt_c-projectCard-lastActiveTime">{new Moment(projectData.lastActiveTime).format('YYYY-MM-DD HH:mm')}</p>
            </div>
        );
    }

});

module.exports = ProjectCard;
