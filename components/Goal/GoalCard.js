/**
 * @jsx React.DOM
 */
var React = require('react');
var PureRenderMixin = require('react/addons').addons.PureRenderMixin;
var cx = React.addons.classSet;
var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;
var Router = require('react-router');
var Moment = require('moment');
var Link = Router.Link;
var Q = require('q');
var _ = require('lodash');
var RB = require('react-bootstrap');
var Input = RB.Input;
var DropdownButton = RB.DropdownButton;
var ModalTrigger = RB.ModalTrigger;
var MenuItem = RB.MenuItem;


/**components*/
var Progress = require('../Progress');
var DataAPI = require('../../utils/DataAPI');
var LogLine = require('../charts/LogLine');
var LoadingMask = require('../LoadingMask');
var GoalEditWindow = require('../../components/Goal/GoadEditWindow');
var Notify = require('../../components/Notify');
var CalendarHeatMap = require('../../components/charts/CalendarHeatMap');

/** Utils */
var Util = require('../../utils/Util');


module.exports = React.createClass({

    //mixins: [PureRenderMixin],
    getInitialState: function () {
        return {
            progress: 0,
            activitiesLoaded: false,
            activitiesLoadFailed: false,
            activities: []
        };
    },

    getDefaultProps: function () {
        return {};
    },

    render: function () {
        var goal = this.props.goal;
        console.log('render goal card');
        var innerDropdown = <DropdownButton title='Granularity'>
            <MenuItem key='year'>year</MenuItem>
            <MenuItem key='month'>month</MenuItem>
            <MenuItem key='week'>week</MenuItem>
            <MenuItem key='day'>day</MenuItem>
        </DropdownButton>
        return (
            <div className={cx({"ltt_c-GoalCard": true})}>
                <div className="ltt_c-GoalCard-item ltt_c-GoalCard-title">
                    {goal.name}
                    <ModalTrigger modal={<GoalEditWindow onSave={this.props.onEdit} goal={goal}/>} ref="modalTrigger">
                        <span className="ltt_c-GoalCard-editBtn"><i className="fa fa-pencil-square"></i></span>
                    </ModalTrigger>
                    <span className="ltt_c-GoalCard-deleteBtn" onClick={this.onDelete}><i className="fa fa-trash"></i></span>
                </div>
                <div className="ltt_c-GoalCard-item ltt_c-GoalCard-granularity">{goal.granularity}</div>
                <div className="ltt_c-GoalCard-item ltt_c-GoalCard-granularity">{this.renderCalendar()}</div>
                <div className="ltt_c-GoalCard-item ltt_c-GoalCard-activities">
                    {this.state.activitiesLoadFailed ?
                        'Load Activity Failed' :
                        (goal.filter ? <LogLine
                            logs={goal.granularity !== 'day' ? this.state.activities.map(getDateData) : this.state.activities}
                            grouped={goal.granularity !== 'day'}
                            granularity={goal.granularity}
                            title={false}
                            xAxisLabel={false}
                            yAxisLabel={false}/> : null)
                    }
                    <LoadingMask loaded={this.state.activitiesLoaded}/>
                </div>
                <div className="ltt_c-GoalCard-item ltt_c-GoalCard-progress">
                    <Progress className="ltt_c-GoalCard-progress" max={goal.estimatedTime || 0} value={this.state.progress || 0}/>
                </div>
            </div>
        )
    },

    componentDidMount: function () {
        //this.calculateProgress();
        var goal = this.props.goal;
        var filter;
        if (goal && (filter = goal.filter)) {
            this.loadActivities(JSON.parse(filter));
        } else {
            this.setState({
                activitiesLoaded: true
            });
        }
    },

    componentWillReceiveProps: function (nextProps) {
        this.loadActivities(JSON.parse(nextProps.goal.filter));
    },

    loadActivities: function (filter) {
        console.log('loadActivities');
        var goal = this.props.goal;
        var dateInfo = Util.toDate(goal.granularity);
        var groupOption = this.getGroupOption(goal.granularity);
        var that = this;
        var params = _.extend({
            sort: 'date: -1',
            group: groupOption,
            sum: true
        }, dateInfo, filter);
        DataAPI.Log.load(params)
            .then(function (data) {
                that.setState({
                    activitiesLoaded: true,
                    activities: data
                }, function () {
                    this.calculateProgress();
                });
            }).fail(function (err) {
                that.setState({
                    activitiesLoaded: true,
                    activitiesLoadFailed: true
                })
            });
    },

    calculateProgress: function () {
        var totalTime;
        if (this.props.goal.granularity === 'day') {
            totalTime = this.state.activities.reduce(function (total, item) {
                return total + (item.len || 0);
            }, 0);
        } else {
            totalTime = this.state.activities.reduce(function (total, item) {
                return total + (item.totalTime || 0);
            }, 0);
        }
        this.setState({
            progress: totalTime
        });
    },

    getGroupOption: function (granularity) {
        return {
            week: 'date.day',
            month: 'date.day',
            year: 'date.month'
        }[granularity];
    },


    updated: function () {
        this.refs.modalTrigger.hide();
    },

    onDelete: function () {
        this.props.onDelete(this.props.goal);
    },

    renderCalendar: function () {
        return null;
        if (this.props.goal.granularity === 'day' ) { return null;}
        return <CalendarHeatMap data={this.state.activities.map(getDateData)}/>
    }
});

function getDateData (item) {
    return {
        date: item._id,
        count: item.totalTime
    };
}