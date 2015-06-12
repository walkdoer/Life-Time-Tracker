/**
 * @jsx React.DOM
 */

var React = require('react');
var _ = require('lodash');
var Moment = require('moment');


/** components */
var Tag = require('../components/Tag');
var DateRangePicker = require('../components/DateRangePicker');


/**Utils */
var DataAPI = require('../utils/DataAPI');

module.exports = React.createClass({

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
            <TaskList tasks={tasks}/>
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


var TaskList = React.createClass({

    render: function () {
        tasks = this.props.tasks;
        return <ul className="ltt_c-page-routine-TaskList">
            {tasks.map(function (task) {
                return <Task task={task}/>
            })}
        </ul>
    }
});
var Task = React.createClass({

    render: function () {
        var task = this.props.task;
        var taskDetail = task._id;
        return <li className="ltt_c-page-routine-Task">
            <span className="title">{taskDetail.name}</span>
            <p className="info">
                <span>{Moment.duration(task.totalTime, "minutes").format("M[m],d[d],h[h],mm[min]")}</span>
                <span>({task.count})</span>
            </p>
        </li>
    }
})