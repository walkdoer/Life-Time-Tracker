/**
 * @jsx React.DOM
 */

var React = require('react');
var _ = require('lodash');
var Moment = require('moment');
var Router = require('react-router');

/** components */
var Tag = require('../components/Tag');
var DateRangePicker = require('../components/DateRangePicker');


/**Utils */
var DataAPI = require('../utils/DataAPI');

module.exports = React.createClass({

    mixins: [Router.State, Router.Navigation],

    getInitialState: function () {
        return {
            start: new Moment().startOf('month').toDate(),
            end: new Moment().endOf('day').toDate(),
            routine: {}
        };
    },

    render: function () {
        var routine = this.state.routine;
        var projectRoutine = routine.project;
        var tagsRoutine = routine.tags;
        var classesRoutine = routine.classes;
        var versionRoutine = routine.version;
        var taskRoutine = routine.task;
        return (
            <div className="ltt_c-page ltt_c-page-routine">
                <header>
                    <DateRangePicker start={this.state.start} end={this.state.end} onDateRangeChange={this.onDateRangeChange}/>
                </header>
                {this.renderTagsRoutine(tagsRoutine)}
                {this.renderProjectRoutine(projectRoutine)}
                {this.renderVersionRoutine(versionRoutine)}
                {this.renderTaskRoutine(taskRoutine)}
            </div>
        );
    },

    renderTagsRoutine: function (tags) {
        if (_.isEmpty(tags)) { return null; }
        return [
            <h3>Tags Routine</h3>
        ].concat(tags.map(function (tag) {
            return <Tag>
                {tag._id}
                (<span style={{color:'#FFD7D3'}}>{Moment.duration(tag.totalTime, "minutes").format("M[m],d[d],h[h],mm[min]")}</span>/
                <span style={{color:'#FDE8AE'}}>{tag.count})</span>
            </Tag>
        }));
    },

    renderTaskRoutine: function (tasks) {
        if (_.isEmpty(tasks)) { return null; }
        return [
            <h3>Task Routine</h3>,
            <List items={tasks} onOpenItem={function (task) {
                var useVersion = task.versionId;
                var url;
                if (useVersion && task.versionId) {
                    url = '/projects/' + task.projectId + '/versions/' + task.versionId + '/tasks/' + task._id;
                } else {
                    url = '/projects/' + task.projectId + '/tasks/' + task._id;
                }
                this.transitionTo(url);
            }.bind(this)}/>
        ];
    },

    renderProjectRoutine: function (projects) {
        if (_.isEmpty(projects)) { return null; }
        return [
            <h3>Project Routine</h3>,
            <List items={projects} onOpenItem={function (project) {
                var url = '/projects/' + project._id;
                this.transitionTo(url);
            }.bind(this)}/>
        ];
    },

    renderVersionRoutine: function (versions) {
        if (_.isEmpty(versions)) { return null; }
        return [
            <h3>Version Routine</h3>,
            <List items={versions} onOpenItem={function (version) {
                var url = '/projects/' + version.projectId + '/versions/' + version._id;
                this.transitionTo(url);
            }.bind(this)}/>
        ];
    },

    componentDidMount: function () {
        this.loadRoutine();
    },

    loadRoutine: function () {
        var that = this;
        DataAPI.Routine.load(_.pick(this.state, ['start', 'end']))
            .then(function (routine) {
                that.setState({
                    routine: routine
                });
            });
    },

    onDateRangeChange: function (start, end) {
        this.setState({
            start: start,
            end: end
        }, function () {
            this.loadRoutine();
        });
    }

});


var List = React.createClass({

    render: function () {
        var items = this.props.items;
        return <ul className="ltt_c-page-routine-List">
            {items.map(function (item) {
                return <ListItem item={item} onTitleClick={this.props.onOpenItem}/>
            }, this)}
        </ul>
    }
});
var ListItem = React.createClass({
    render: function () {
        var item = this.props.item;
        var itemDetail = item._id;
        return <li className="ltt_c-page-routine-ListItem">
            <span className="title" onClick={this.onTitleClick}>{itemDetail.name}</span>
            <p className="info">
                <span>{Moment.duration(item.totalTime, "minutes").format("M[m],d[d],h[h],mm[min]")}</span>
                <span>({item.count})</span>
            </p>
        </li>
    },

    onTitleClick: function () {
        this.props.onTitleClick(this.props.item._id);
    }
});