/**
 * @jsx React.DOM
 */

var React = require('react');
var _ = require('lodash');
var Moment = require('moment');
var extend = require('extend');
var RB = require('react-bootstrap');
var ButtonGroup = RB.ButtonGroup;
var Button = RB.Button;

/** components */
var WordsCloud = require('../components/charts/WordsCloud');
var DateRangePicker = require('../components/DateRangePicker');
var LoadingMask = require('../components/LoadingMask');
var Bar = require('../components/charts/Bar');
var TimeColumn = require('../components/charts/TimeColumn');

/** Uitls */
var DataAPI = require('../utils/DataAPI');

/** constant */
var DATE_FORMAT = 'YYYY-MM-DD';


module.exports = React.createClass({

    getInitialState: function () {
        return {
            startDate: new Moment().subtract(1, 'month').toDate(),
            endDate: new Moment().toDate(),
            projectSumData: [],
            selectProject: null,
            loaded: false
        };
    },

    render: function () {
        var barHeight = this.state.projectSumData.length * 30;
        return (
            <div className="ltt_c-report ltt_c-report-projects">
                <div>
                     <DateRangePicker ref="dateRange" start={this.state.startDate} end={this.state.endDate}
                            onDateRangeChange={this.onDateRangeChange}/>
                </div>
                <div ref='activity'></div>
                <div style={{height: barHeight}}>
                    <Bar data={this.state.projectSumData} onPointClick={this.onBarClick}/>
                </div>
                <LoadingMask loaded={this.state.loaded}/>
            </div>
        );
    },

    adaptData: function (data) {
        return (data || []).map(function (item) {
            var id = item._id;
            var name;
            if (id === null) {
                name = '未归类'
            } else {
                name = id.name
            }
            return {
                name: name,
                count: item.totalTime
            };
        }).sort(function (a, b) {
            return b.count - a.count;
        });
    },

    componentDidMount: function () {
        this.loadProjectSumData();
    },

    onDateRangeChange: function (start, end) {
        this.setState({
            startDate: start,
            endDate: end,
            loaded: false
        }, function () {
            this.loadProjectSumData();
        });

    },

    loadProjectSumData: function () {
        var that = this;
        DataAPI.Log.load(extend({
            sum: true,
            group: 'project'
        }, this.getDateParams()))
        .then(function (data) {
            var adaptedData = that.adaptData(data);
            that.setState({
                loaded: true,
                projectSumData: adaptedData
            });
        })
        .catch(function (err) {
            console.error(err.stack);
        });
    },

    onBarClick: function (value) {
        React.renderComponent(<ActivityDetail
            projectName={value.category}
            startDate={this.state.startDate}
            endDate={this.state.endDate}/>, this.refs.activity.getDOMNode());
    },


    getDateParams: function () {
        return {
            start: new Moment(this.state.startDate).format(DATE_FORMAT),
            end: new Moment(this.state.endDate).format(DATE_FORMAT)
        };
    }

});



var ActivityDetail = React.createClass({

    getInitialState: function () {
        return {
            granularity: 'day',
            data: []
        };
    },

    render: function () {
        var granularity = this.state.granularity;
        return (
            <div>
                <ButtonGroup onClick={this.changeActivityGranularity}>
                    {['year', 'month' ,'week', 'day'].map(function (name) {
                        return <Button active={name === granularity}>{name}</Button>
                    })}
                </ButtonGroup>
                <TimeColumn name={this.props.projectName} data={this.state.data}/>
            </div>
        );
    },

    changeActivityGranularity: function (e) {
        var granularity = e.target.textContent.toLowerCase();
        this.setState({
            granularity: granularity
        }, function () {
            this.loadSingleProjectActivity(this.props.projectName, this.state.granularity);
        });
    },

    componentDidMount: function () {
        this.loadSingleProjectActivity(this.props.projectName, this.state.granularity);
    },

    componentWillReceiveProps: function () {
        this.loadSingleProjectActivity(this.props.projectName, this.state.granularity);
    },

    loadSingleProjectActivity: function (projectName, granularity) {
        var id;
        var that = this;
        DataAPI.Log.load(extend({
            projects: projectName,
            sum: true,
            group: granularity ? 'date.' + granularity : 'date'
        }, this.getDateParams()))
        .then(function (data) {
            data = data.sort(function (a, b) {
                if (granularity === 'week') {
                    var mStart = new Moment(that.props.startDate);
                    var mA = new Moment(mStart.year() + '-W' + a._id);
                    var mB = new Moment(mStart.year() + '-W' + b._id);
                    return mA.unix() - mB.unix();
                } else {
                    return new Moment(a._id).unix() - new Moment(b._id).unix();
                }
            }).map(function (item) {
                if (granularity === 'week') {
                    var mStart = new Moment(that.props.startDate);
                    time = new Moment(mStart.year() + '-W' + item._id);
                    return [time.unix() * 1000, item.totalTime];
                } else {
                    return [new Moment(item._id).unix() * 1000, item.totalTime];
                }

            });
            that.setState({
                data: data
            });
        }).catch(function (err) {
            Notify.error('load activity for project ' + projectName + 'have failed');
            console.error(err.stack);
        });
    },
    getDateParams: function () {
        return {
            start: new Moment(this.props.startDate).format(DATE_FORMAT),
            end: new Moment(this.props.endDate).format(DATE_FORMAT)
        };
    }
})

