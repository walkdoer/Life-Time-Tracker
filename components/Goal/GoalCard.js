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
//var Progress = require('../Progress');
var ProgressBar = require('../ProgressBar');
var DataAPI = require('../../utils/DataAPI');
var LogLine = require('../charts/LogLine');
var LoadingMask = require('../LoadingMask');
var GoalEditWindow = require('../../components/Goal/GoadEditWindow');
var Notify = require('../../components/Notify');
var GoalChart = require('../../components/charts/GoalChart');

/** Utils */
var Util = require('../../utils/Util');


module.exports = React.createClass({

    //mixins: [PureRenderMixin],
    getInitialState: function () {
        return {
            totalTime: 0,
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
        var dateInfo = Util.toDate(goal.granularity);
        var estimatedTime = goal.estimatedTime;
        var oneDayTime = estimatedTime / dateInfo.diff;
        var durationDays = new Moment().diff(new Moment().startOf(goal.granularity), 'day') + 1;
        var expectTime = oneDayTime * durationDays;
        var restTime = 0;
        var totalTime = this.state.totalTime;
        var todayTime = this.state.todayTime;
        if (totalTime) {
            restTime = totalTime - todayTime;
        }


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
                    <div className="ltt_c-GoalCard-title-btns">
                        <ModalTrigger modal={<GoalEditWindow onSave={this.props.onEdit} goal={goal}/>} ref="modalTrigger">
                            <span className="ltt_c-GoalCard-editBtn"><i className="fa fa-pencil-square"></i></span>
                        </ModalTrigger>
                        <span className="ltt_c-GoalCard-deleteBtn" onClick={this.onDelete}><i className="fa fa-trash"></i></span>
                    </div>
                </div>
                <div className="ltt_c-GoalCard-item ltt_c-GoalCard-granularity">{goal.granularity}</div>
                <div className="ltt_c-GoalCard-item ltt_c-GoalCard-granularity" style={{width: 200}}>{this.renderCalendar()}</div>
                <div className="ltt_c-GoalCard-item ltt_c-GoalCard-activities">
                    {this.state.activitiesLoadFailed ?
                        'Load Activity Failed' :
                        (goal.filter ? <LogLine
                            logs={this.state.activities}
                            grouped={goal.granularity !== 'day'}
                            granularity={goal.granularity}
                            expect={oneDayTime}
                            title={false}
                            xAxisLabel={false}
                            yAxisLabel={false}/> : null)
                    }
                </div>
                <div className="ltt_c-GoalCard-item ltt_c-GoalCard-totalTime" style={{width: 100}}>{Util.displayTime(totalTime)}</div>
                <div className="ltt_c-GoalCard-item ltt_c-GoalCard-progress" style={{width: 200}}>
                    <ProgressBar className="ltt_c-GoalCard-progress"
                        max={goal.estimatedTime || 0}
                        expect={expectTime}
                        value={[restTime, todayTime]}/>
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
                var today = new Moment().format(Util.DATE_FORMAT);
                var todayTime = 0;
                var totalTime = data ? data.reduce(function (total, item) {
                    if (today === item._id) {
                        todayTime += item.totalTime;
                    }
                    return total + (item.totalTime || 0);
                }, 0) : 0;
                data = Util.fillDataGap(data || [], dateInfo.start, dateInfo.end);
                that.setState({
                    activitiesLoaded: true,
                    totalTime: totalTime,
                    todayTime: todayTime,
                    activities: data
                });
            }).fail(function (err) {
                console.error(err.stack);
                that.setState({
                    activitiesLoaded: true,
                    activitiesLoadFailed: true
                })
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
        var granularity = this.props.goal.granularity;
        var estimatedTime = this.props.goal.estimatedTime;
        if (granularity === 'day' ) { return null;}
        var dateInfo = Util.toDate(granularity);
        var max = estimatedTime / dateInfo.diff;
        return <GoalChart data={this.state.activities}
            start={dateInfo.start}
            end={dateInfo.end}
            type={granularity}
            threshold={max}
            rowItemCount={12}
            itemPadding={2}
            width={180}
            height={80}/>
    }
});