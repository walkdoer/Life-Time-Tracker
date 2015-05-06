/**
 * @jsx React.DOM
 */

var React = require('react');
var _ = require('lodash');
var Moment = require('moment');
var extend = require('extend');

/** components */
var WordsCloud = require('../components/charts/WordsCloud');
var DateRangePicker = require('../components/DateRangePicker');
var LoadingMask = require('../components/LoadingMask');
var Bar = require('../components/charts/Bar');
var Column = require('../components/charts/Column');

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
                <div ref="activity"></div>
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
        alert(value);
        this.loadSingleProjectActivity(value.category);
    },

    loadSingleProjectActivity: function (projectName) {
        var id;
        var that = this;
        /*this.state.projectSumData.some(function (project) {
            if (project._id && project._id.name === projectName) {
                id = project._id._id;
                return true;
            }
        });*/
        DataAPI.Log.load(extend({
            projects: projectName,
            sum: true,
            group: 'date'
        }, this.getDateParams()))
        .then(function (data) {
            data = data.map(function (item) {
                return {
                    label: item._id,
                    count: item.totalTime
                };
            });
            React.renderComponent(<Column data={data}/>, that.refs.activity.getDOMNode());
        }).catch(function (err) {
            Notify.error('load activity for project ' + projectName + 'have failed');
            console.error(err.stack);
        });
    },

    getDateParams: function () {
        return {
            start: new Moment(this.state.startDate).format(DATE_FORMAT),
            end: new Moment(this.state.endDate).format(DATE_FORMAT)
        };
    }

});

