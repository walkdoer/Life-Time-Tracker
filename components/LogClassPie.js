var React = require('react');
var Moment = require('moment');
var _ = require('lodash');
var PureRenderMixin = require('react/addons').addons.PureRenderMixin;
var ReactBootStrap = require('react-bootstrap');
var numeral = require('numeral');
var Pie = require('./charts/Pie');

/** configs */
var classesMap = require('../conf/config').classesMap;
var logClasses = _.pairs(classesMap).map(function (obj) {
    return {
        value: obj[0],
        text: obj[1]
    };
});

/** components */
var LoadingMask = require('../components/LoadingMask');

/** Utils */
var DataAPI = require('../utils/DataAPI');

/** constants */
var DATE_FORMAT = 'YYYY-MM-DD HH:mm:ss';

module.exports = React.createClass({

    mixins: [PureRenderMixin],

    getInitialState: function () {
        return {
            loaded: false
        };
    },

    render: function () {
        var today = this.state.today;
        var yesterday = this.state.yesterday;
        var logClassTime, yesterDayLogClassTime;
        if (today) {
            logClassTime = today.classTime;
        }
        if (yesterday) {
            yesterDayLogClassTime = yesterday.classTime;
        }
        var highchartOptions = {
            title: false,
            plotOptions: {
                pie: {
                    innerSize: '60%',
                    dataLabels: {
                        enabled: true
                    }
                }
            },
            legend: {
                enabled: false,
                align: 'right',
                verticalAlign: 'top',
                layout: 'vertical',
                x: 0,
                y: 100
            },
            exporting: {
                enabled: false
            }
        };
        if (this.props.backgroundColor) {
            highchartOptions.chart = {
                backgroundColor: this.props.backgroundColor
            };
        }
        return (
            <div className="ltt_c-LogClassPie">
                {logClassTime ? <Pie data={logClassTime} highchartOptions={highchartOptions}/> : null }
                <LoadingMask loaded={this.state.loaded}/>
            </div>
        );
    },

    //{yesterDayLogClassTime ? <Pie data={yesterDayLogClassTime} highchartOptions={highchartOptions}/> : null }

    componentDidMount: function (argument) {
        var that = this;
        DataAPI.stat({
            start: new Moment().startOf('day').format(DATE_FORMAT),
            end: new Moment().endOf('day').format(DATE_FORMAT)
        }).then(function (statResult) {
            that.setState({
                loaded: true,
                today: statResult
            });
        }).then(function () {
            return DataAPI.stat({
                start: new Moment().subtract(1, 'day').startOf('day').format(DATE_FORMAT),
                end: new Moment().subtract(1, 'day').endOf('day').format(DATE_FORMAT)
            });
        }).then(function (statResult) {
            that.setState({
                yesterday: statResult
            });
        });
    }
})