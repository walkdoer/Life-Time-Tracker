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
var PureRenderMixin = require('react/addons').addons.PureRenderMixin;

/** components */
var FullDateRangePicker = require('../components/FullDateRangePicker');
var ActivityBar = require('../components/charts/ActivityBar');
var D3TreeMap = require('../components/charts/D3TreeMap');
var DataAPI = require('../utils/DataAPI');

/** constant */
var DATE_FORMAT = 'YYYY-MM-DD';


module.exports = React.createClass({

    mixins: [PureRenderMixin],

    getInitialState: function () {
        return {
            startDate: new Moment().startOf('month').toDate(),
            endDate: new Moment().endOf('month').toDate(),
            root: null
        };
    },

    render: function () {
        return (
            <div className="ltt_c-report ltt_c-report-projects">
                <D3TreeMap root={this.state.root}/>
                <div>
                    <FullDateRangePicker
                        ref="dateRange"
                        showCompare={false}
                        period="month"
                        granularity="month"
                        start={this.state.startDate} end={this.state.endDate}
                        onDateRangeChange={this.onDateRangeChange}/>
                </div>
                <ActivityBar
                    params={{group: 'project'}}
                    detailParams={function (selectItem) {
                        return {
                            projects: selectItem
                        };
                    }}
                    startDate={this.state.startDate}
                    endDate={this.state.endDate}/>
            </div>
        );
    },


    onDateRangeChange: function (start, end) {
        this.setState({
            startDate: start,
            endDate: end,
        });
    },

    componentDidMount: function () {
        this.loadProjectData();
    },


    loadProjectData: function () {
        var that = this;
        DataAPI.Log.load({
            sum: true,
            group: 'project'
        })
        .then(function (data) {
            var adaptedData = that.adaptData(data);
            that.setState({
                root: adaptedData
            });
        })
        .catch(function (err) {
            console.error(err.stack);
        });
    },

    adaptData: function (datas) {
        return {
            name: 'project map',
            children: datas.map(function (data) {
                var project = data._id;
                if (project === null) {
                    return {
                        name: '未归类',
                        size: data.totalTime
                    };
                }
                return {
                    name: project.name,
                    size: data.totalTime
                };
            })
        };
    }

});

