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
            loaded: false,
            compare: true
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
                        enabled: true,
                        distance: 3,
                        connectorPadding: 5,
                        format: '<b>{point.name}</b>: {point.percentage:.1f} %',
                        style: {
                            color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black',
                            fontSize: "11px"
                        }
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
                <h1>{this.props.title}</h1>
                {logClassTime ? <Pie data={logClassTime} highchartOptions={highchartOptions}/> : null }
                {this.props.compare ? this.renderCompare() : null}
                <LoadingMask loaded={this.state.loaded}/>
            </div>
        );
    },

    renderCompare: function () {
        var today = this.state.today;
        var yesterday = this.state.yesterday;
        var logClassTime, yesterDayLogClassTime;
        if (today) {
            logClassTime = today.classTime;
        }
        if (yesterday) {
            yesterDayLogClassTime = yesterday.classTime;
        }
        return (
            <div className="ltt_c-LogClassPie-changes">
            {logClasses.map(function (logClass) {
                var time = 0, yesterdayTime;
                var classId = logClass.value;
                var data;
                if (!_.isEmpty(logClassTime)) {
                    data = logClassTime.filter(function(item) {
                        return item.id === classId;
                    })[0];
                    if (data) {
                        time = data.count;
                    }
                }
                if (!_.isEmpty(yesterDayLogClassTime)) {
                    data = yesterDayLogClassTime.filter(function(item) {
                        return item.id === classId;
                    })[0];
                    if (data) {
                        yesterdayTime = data.count;
                    }
                }
                var progressNumber, progressPercentage, progress;
                if (yesterdayTime > 0) {
                    progressNumber = time - yesterdayTime;
                    progressPercentage = progressNumber / yesterdayTime;
                    progress = (
                        <p className={'changeItem ' + (progressNumber > 0 ? 'rise' : (progressNumber < 0 ? 'down' : 'equal'))}>
                            <span className="name">{logClass.text}</span>
                            <span className="num">
                            <i className={"fa fa-" + (progressNumber > 0 ? 'long-arrow-up' :
                                (progressNumber < 0 ? 'long-arrow-down' : 'minus'))}></i>
                            {numeral(progressPercentage * 100).format('0.0')}%
                            </span>
                        </p>
                    );
                }
                return progress;
            })}
            </div>
        );
    },

    //{yesterDayLogClassTime ? <Pie data={yesterDayLogClassTime} highchartOptions={highchartOptions}/> : null }

    loadData: function (nextProps) {
        if (!nextProps) {
            props = this.props;
        } else {
            props = nextProps;
        }
        var start = props.start,
            end = props.end,
            date = props.date;
        var that = this;
        if (start && end) {
            start = new Moment(start).startOf('day').format(DATE_FORMAT);
            end = new Moment(end).endOf('day').format(DATE_FORMAT);
        } else if (date) {
            start = new Moment(date).startOf('day').format(DATE_FORMAT);
            end = new Moment(date).endOf('day').format(DATE_FORMAT);
        }
        var promise = DataAPI.stat({
            start: new Moment(start).startOf('day').format(DATE_FORMAT),
            end: new Moment(end).endOf('day').format(DATE_FORMAT)
        }).then(function (statResult) {
            that.setState({
                loaded: true,
                today: statResult
            });
        });
        if (this.props.compare) {
            return promise.then(function () {
                return DataAPI.stat({
                    start: new Moment(start).subtract(1, 'day').startOf('day').format(DATE_FORMAT),
                    end: new Moment(end).subtract(1, 'day').endOf('day').format(DATE_FORMAT)
                });
            }).then(function (statResult) {
                that.setState({
                    yesterday: statResult
                });
            });
        } else {
            return promise;
        }
    },

    componentDidMount: function () {
        this.loadData();
    },

    componentWillReceiveProps: function (nextProps) {
        this.loadData(nextProps);
    },

    update: function () {
        this.loadData();
    }
})