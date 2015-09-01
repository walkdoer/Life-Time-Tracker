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

/** Utils */
var DataAPI = require('../utils/DataAPI');

/** constants */
var DATE_FORMAT = 'YYYY-MM-DD HH:mm:ss';

module.exports = React.createClass({

    mixins: [PureRenderMixin],

    getDefaultProps: function () {
        return {
            type: 'day'
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
        return (
            <div className="ltt_c-Board">
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
        DataAPI.stat({
            start: new Moment().startOf(dateType).format(DATE_FORMAT),
            end: new Moment().endOf(dateType).format(DATE_FORMAT)
        }).then(function (statResult) {
            that.setState({
                loaded: true,
                currentPeriod: statResult
            });
        }).then(function () {
            return DataAPI.stat({
                start: new Moment().subtract(1, dateType).startOf(dateType).format(DATE_FORMAT),
                end: new Moment().subtract(1, dateType).endOf(dateType).format(DATE_FORMAT)
            });
        }).then(function (statResult) {
            that.setState({
                prevPeriod: statResult
            });
        });
    }
})