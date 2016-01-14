var React = require('react');
var Moment = require('moment');
var _ = require('lodash');
var PureRenderMixin = require('react/addons').addons.PureRenderMixin;
var ReactBootStrap = require('react-bootstrap');
var numeral = require('numeral');

/** configs */
var config = require('../conf/config');

/** components */
var LoadingMask = require('../components/LoadingMask');
var TinyLine = require('../components/charts/TinyLine.js');

/** Utils */
var DataAPI = require('../utils/DataAPI');
var Util = require('../utils/Util');

/** constants */
var DATE_FORMAT = 'YYYY-MM-DD HH:mm:ss';

module.exports = React.createClass({

    mixins: [PureRenderMixin],

    getDefaultProps: function () {
        return {
            type: 'day',
            week: null
        };
    },

    getInitialState: function () {
        return {
            loaded: false
        };
    },

    render: function () {
        var currentPeriod = this.state.currentPeriod;
        var prevPeriod = this.state.prevPeriod;
        var logClasses = config.classes;
        var currentLogClassTime, prevLogClassTime;
        if (currentPeriod) {
            currentLogClassTime = currentPeriod.classTime;
        }
        if (prevPeriod) {
            prevLogClassTime = prevPeriod.classTime;
        }
        var className = 'ltt_c-Board';
        if (this.props.className) {
            className += ' ' + this.props.className;
        }
        return (
            <div className={className} style={{height:137}}>
                {logClasses.map(function (logClass) {
                    var time = 0, prevPeriodTime;
                    var classId = logClass._id;
                    var data;
                    if (!_.isEmpty(currentLogClassTime)) {
                        data = currentLogClassTime.filter(function(item) {
                            return item.id === classId;
                        })[0];
                        if (data) {
                            time = data.count;
                        }
                    }
                    if (!_.isEmpty(prevLogClassTime)) {
                        data = prevLogClassTime.filter(function(item) {
                            return item.id === classId;
                        })[0];
                        if (data) {
                            prevPeriodTime = data.count;
                        }
                    }
                    var progressNumber, progressPercentage, progress;
                    if (prevPeriodTime > 0) {
                        progressNumber = time - prevPeriodTime;
                        progressPercentage = progressNumber / prevPeriodTime;
                        progress = (
                            <span className={progressNumber > 0 ? 'rise' : (progressNumber < 0 ? 'down' : 'equal')}>
                                <i className={"fa fa-" + (progressNumber > 0 ? 'long-arrow-up' :
                                    (progressNumber < 0 ? 'long-arrow-down' : 'minus'))}></i>
                                {numeral(progressPercentage * 100).format('0.0')}%
                            </span>
                        );
                    }
                    return (
                        <div className="ltt_c-Board-item">
                            <p className="ltt_c-Board-item-number">{time}</p>
                            <p className="ltt_c-Board-item-name">{logClass.name}</p>
                            <p className="past-seven-day-activity">
                                <TinyLine value={function () {
                                    var today = new Moment();
                                    var end = today.format(Util.DATE_FORMAT);
                                    var start = today.subtract(7, 'day').format(Util.DATE_FORMAT);
                                    return DataAPI.Log.load({
                                        sum: true,
                                        classes:logClass._id,
                                        group: 'date',
                                        start: start,
                                        end: end
                                    }).then(function(data) {
                                        return Util.fillDataGap(data, start, end, function (item) {
                                            return item.count;
                                        }).join(',');
                                    });
                                }}/>
                            </p>
                            <p className="ltt_c-Board-item-change">{progress}</p>
                        </div>
                    );
                })}
                <LoadingMask loaded={this.state.loaded}/>
            </div>
        );
    },

    componentDidMount: function (argument) {
        var that = this;
        var dateType = this.props.type;
        var currentStartEnd = this._getStartEnd();
        var prevStartEnd = this._getPrevStartEnd();
        DataAPI.stat(currentStartEnd).then(function (statResult) {
            that.setState({
                loaded: true,
                currentPeriod: statResult
            });
        }).then(function () {
            return DataAPI.stat(prevStartEnd);
        }).then(function (statResult) {
            that.setState({
                prevPeriod: statResult
            });
        });
    },

    _getStartEnd: function () {
        var week = this.props.week;
        var type = this.props.type;
        var period;
        if (type === 'week') {
            if (_.isNumber(week)) {
                period = {
                    start: new Moment().week(week).startOf(type).format(DATE_FORMAT),
                    end: new Moment().week(week).endOf(type).format(DATE_FORMAT)
                };
            } else {
                period = {
                    start: new Moment().startOf(type).format(DATE_FORMAT),
                    end: new Moment().endOf(type).format(DATE_FORMAT)
                };
            }
        } else if (type === 'day') {
            period = {
                start: new Moment().startOf(type).format(DATE_FORMAT),
                end: new Moment().endOf(type).format(DATE_FORMAT)
            };
        }
        return period;
    },

    _getPrevStartEnd: function () {
        var period = this._getStartEnd();
        return {
            start: Moment(period.start).subtract(1, this.props.type).toDate(),
            end: Moment(period.end).subtract(1, this.props.type).toDate()
        };
    }
})