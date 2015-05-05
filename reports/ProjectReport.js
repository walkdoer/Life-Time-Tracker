/**
 * @jsx React.DOM
 */

var React = require('react');
var _ = require('lodash');
var Moment = require('moment');

/** components */
var WordsCloud = require('../components/charts/WordsCloud');
var DateRangePicker = require('../components/DateRangePicker');
var LoadingMask = require('../components/LoadingMask');
var Bar = require('../components/charts/Bar');


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
                <div style={{height: barHeight}}>
                    <Bar data={this.state.projectSumData}/>
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
        DataAPI.Log.load({
            start: new Moment(this.state.startDate).format(DATE_FORMAT),
            end: new Moment(this.state.endDate).format(DATE_FORMAT),
            sum: 'true',
            group: 'project'
        })
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
    }

});

