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

    getInitialState: function () {
        return {
            loaded: false
        };
    },

    render: function () {
        var today = this.state.today;
        var yesterday = this.state.yesterday;
        var logClasses = config.classes;
        var logClassTime, yesterDayLogClassTime;
        if (today) {
            logClassTime = today.classTime;
        }
        if (yesterday) {
            yesterDayLogClassTime = yesterday.classTime;
        }
        return (
            <div className="ltt_c-Board">
                {logClasses.map(function (logClass) {
                    var time = 0, yesterdayTime;
                    var classId = logClass._id;
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