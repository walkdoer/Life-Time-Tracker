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
            compare: true,
            legend: false
        };
    },

    render: function () {
        var currentData = this.state.currentData;
        var compareData = this.state.compareData;
        var logClasses = config.classes;
        var type = this.props.type;
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
                enabled: this.props.legend
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
        currentData = currentData && currentData.map(function (item) {
            var label = item._id;
            if (type === "classes") {
                label = _.find(logClasses, {'_id': item._id});
            }
            if (!label) {
                label = {
                    name: 'unknow'
                };
            }
            return {
                value: item.totalTime,
                label: label.name || label
            };
        });
        return (
            <div className="ltt_c-LogClassPie" style={this.getStyle()}>
                <h1>{this.props.title}</h1>
                {currentData ? <Pie data={currentData} highchartOptions={highchartOptions} ref="pieChart"/> : null }
                <LoadingMask loaded={this.state.loaded} opacity={1}/>
            </div>
        );
    },

    getStyle: function () {
        var style = {};
        if (this.props.height) {
            style.height = this.props.height;
        }
        return style;
    },

    renderCompare: function () {
        var currentData = this.state.currentData;
        var compareData = this.state.compareData;
        var logClasses = config.classes;
        var pieChart = this.refs.pieChart;
        logClasses.forEach(function (logClass) {
            var time = 0, yesterdayTime;
            var classId = logClass._id;
            time = getTimeConsumeBy(classId, currentData);
            yesterdayTime = getTimeConsumeBy(classId, compareData);
            var cpToYesterday = compare(time, yesterdayTime);
            var name = logClass.name + ' ' + numeral(cpToYesterday * 100).format('0.0') + '%';
            pieChart.updateLegend(logClass.name, name);
        });
    },

    loadData:function (nextProps) {
        if (!nextProps) {
            props = this.props;
        } else {
            props = nextProps;
        }
        var type =  props.type,
            date = props.date,
            start = props.start,
            end = props.end;
        if (!start && !end) {
            start = Moment(date).startOf('day');
            end = Moment(date).endOf('day');
        }
        var that = this;
        return Q.all([
            loadCurrent(),
            props.compare ? loadCompare() : Q(null)
        ]).spread(function (current, compare) {
            that.setState({
                loaded: true,
                currentData: current,
                compareData: compare
            }, function () {
                if (this.props.compare) {
                    this.renderCompare();
                }
            });
        }).catch(function (err) {
            console.error(err.stack);
        });

        function loadCompare() {
            var diff = end.diff(start, 'day');
            var cEnd = Moment(start).subtract(1, 'day').endOf('day');// compare end
            var cStart = Moment(cEnd).subtract(diff, 'day').startOf('day');
            return DataAPI.Log.load({
                start: cStart.format(DATE_FORMAT),
                end: cEnd.format(DATE_FORMAT),
                sum: true,
                group: type
            });
        }

        function loadCurrent() {
            return DataAPI.Log.load({
                start: Moment(start).startOf('day').format(DATE_FORMAT),
                end: Moment(end).endOf('day').format(DATE_FORMAT),
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
