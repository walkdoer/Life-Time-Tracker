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
                <div className="ltt_c-GoalCard-item ltt_c-GoalCard-granularity" style={{width: 200}}>{this.renderCalendar()}</div>
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
                </div>
                <div className="ltt_c-GoalCard-item ltt_c-GoalCard-totalTime" style={{width: 100}}>{Util.displayTime(this.state.totalTime)}</div>
                <div className="ltt_c-GoalCard-item ltt_c-GoalCard-progress" style={{width: 200}}>
                    <Progress className="ltt_c-GoalCard-progress" max={goal.estimatedTime || 0} value={this.state.totalTime || 0}/>
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
                data.sort(function (a, b) {
                    return new Date(a._id).getTime() - new Date(b._id).getTime();
                });
                that.setState({
                    activitiesLoaded: true,
                    activities: data
                }, function () {
                    this.calculateProgress();
                });
            }).fail(function (err) {
                console.error(err.stack);
                that.setState({
                    activitiesLoaded: true,
                    activitiesLoadFailed: true
                })
            });
    },

    calculateProgress: function () {
        var totalTime;
        totalTime = this.state.activities.reduce(function (total, item) {
            return total + (item.totalTime || 0);
        }, 0);
        this.setState({
            totalTime: totalTime
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
        return <GoalChart data={this.state.activities.map(function (item, index) {
            return {
                date: item._id,
                count: item.totalTime
            };
        })}
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

function getDateData (item) {
    return {
        date: item._id,
        count: item.totalTime
    };
}