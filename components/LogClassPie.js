var React = require('react');
var Moment = require('moment');
var _ = require('lodash');
var PureRenderMixin = require('react/addons').addons.PureRenderMixin;
var ReactBootStrap = require('react-bootstrap');
var numeral = require('numeral');
var Pie = require('./charts/Pie');
var Q = require('q');

var config = require('../conf/config');
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

    getDefaultProps: function () {
        return {
            compare: true
        };
    },

    render: function () {
        var todayData = this.state.todayData;
        var yesterdayData = this.state.yesterdayData;
        var logClasses = config.classes;
        var highchartOptions = {
            title: false,
            plotOptions: {
                pie: {
                    innerSize: '40%',
                    dataLabels: {
                        enabled: false,
                        distance: 3,
                        useHTML: true,
                        connectorPadding: 5,
                        style: {
                            color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black',
                            fontSize: "11px"
                        },
                        formatter: function () {
                            return '<span style="color:' + this.point.color + '">' +
                                '<b>' + this.point.name + '</b>' + numeral(this.point.y).format('0.0') + '%' +
                                '</span>';
                        }
                    }
                }
            },
            legend: {
                enabled: false,
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
        todayData = todayData && todayData.map(function (item) {
            var cls = _.find(logClasses, {'_id': item._id});
            return {
                value: item.totalTime,
                label: (cls && cls.name) || item._id
            };
        });
        return (
            <div className="ltt_c-LogClassPie">
                <h1>{this.props.title}</h1>
                {todayData ? <Pie data={todayData} highchartOptions={highchartOptions}/> : null }
                {this.props.compare ? this.renderCompare() : null}
                <LoadingMask loaded={this.state.loaded}/>
            </div>
        );
    },

    renderCompare: function () {
        var todayData = this.state.todayData;
        var yesterdayData = this.state.yesterdayData;
        var logClasses = config.classes;
        return (
            <div className="ltt_c-LogClassPie-changes">
            {logClasses.map(function (logClass) {
                var time = 0, yesterdayTime;
                var classId = logClass._id;
                time = getTimeConsumeBy(classId, todayData);
                yesterdayTime = getTimeConsumeBy(classId, yesterdayData);
                var cpToYesterday = compare(time, yesterdayTime);
                return (
                    <p className={'changeItem ' + (cpToYesterday > 0 ? 'rise' : (cpToYesterday < 0 ? 'down' : 'equal'))}>
                        <span className="name">{logClass.name}</span>
                        <span className="num">
                        <i className={"fa fa-" + (cpToYesterday > 0 ? 'long-arrow-up' :
                            (cpToYesterday < 0 ? 'long-arrow-down' : 'minus'))}></i>
                        {numeral(cpToYesterday * 100).format('0.0')}%
                        </span>
                    </p>
                );
            })}
            </div>
        );
    },

    loadData:function (nextProps) {
        if (!nextProps) {
            props = this.props;
        } else {
            props = nextProps;
        }
        var type = 'classes',
            date = props.date;
        var that = this;
        return Q.all([
            loadToday(),
            loadYesterDay()
        ]).spread(function (today, yesterday) {
            that.setState({
                loaded: true,
                todayData: today,
                yesterdayData: yesterday
            });
        }).catch(function (err) {
            console.error(err.stack);
        });

        function loadYesterDay() {
            return DataAPI.Log.load({
                start: new Moment(date).subtract(1, 'day').startOf('day').format(DATE_FORMAT),
                end: new Moment(date).subtract(1, 'day').endOf('day').format(DATE_FORMAT),
                sum: true,
                group: type
            });
        }

        function loadToday() {
            return DataAPI.Log.load({
                start: new Moment(date).startOf('day').format(DATE_FORMAT),
                end: new Moment(date).endOf('day').format(DATE_FORMAT),
                group: type,
                sum: true
            })
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
});


function compare(a, b) {
    if (a === b) {
        return 0;
    }
    if (b !== undefined && b !== 0) {
        return (a - b) / b;
    } else {
        return 1;
    }
}
function getTimeConsumeBy(id, data) {
    var time = 0, target;
    if (!_.isEmpty(data)) {
        target = data.filter(function(item) {
            return item._id === id;
        })[0];
        if (target) {
            time = target.totalTime;
        }
    }
    return time;
}
