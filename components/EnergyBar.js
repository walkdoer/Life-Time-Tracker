var React = require('react');
var PureRenderMixin = require('react/addons').addons.PureRenderMixin;
var TrackerHelper = require('tracker/helper');
var _ = require('lodash');
var Moment = require('moment');
var Q = require('q');

/** Components */
var Settings = require('../pages/Settings');
var Progress = require('./Progress');
var Bus = require('../utils/Bus');
var SetIntervalMixin = require('./mixins/setInterval');
var LogEditor = require('../components/editor/LogEditor');

/** Utils */
var DataAPI = require('../utils/DataAPI');

/** constants */
var EVENT = require('../constants/EventConstant');

module.exports = React.createClass({

    mixins: [PureRenderMixin, SetIntervalMixin],

    getInitialState: function () {
        return {
            energy: Settings.getEnergySettings().energy,
            energyCost: 0
        };
    },

    render: function () {
        return (
            <Progress max={100} value={this.state.energy + this.state.energyCost}/>
        );
    },

    componentWillMount: function () {
        Bus.addListener(EVENT.LOG_CHANGE, this.updateEnergy);

    },


    componentWillUnmount: function () {
        Bus.removeListener(EVENT.LOG_CHANGE, this.loadAppInfo);
        //Bus.removeListener(EVENT.CHECK_SYNC_STATUS, this.checkSyncStatus);
    },

    updateEnergy: function (date, logs, callback) {
        if (new Moment().diff(date, 'day') >= 0) {
            if (_.isString(logs)) {
                logs = TrackerHelper.getLogs(logs, date);
            }
            var energyCost = this._calculateEnergyCost(date, logs);
            this.setState({
                energyCost: energyCost
            }, function () {
                callback && callback(energyCost);
            });
        }
    },

    componentDidMount: function () {
        var that = this;
        this.currentDay = new Moment('2015-05-21');
        if (this.intervalId) {
            this.clearInterval(this.intervalId);
        }
        this.update();
        this.intervalId = this.setInterval(function () {
            that.update();
        }, 60000);
    },

    update: function () {
        var that = this;
        this.getLogContent().then(function (result) {
            var yesterday = new Moment().subtract(1, 'day').format('YYYY-MM-DD');
            var logs = TrackerHelper.getLogs(result.content, result.date);
            if (result.moveToNextDay) {
                //update yesterday's energy and move to next day
                that.updateEnergy(result.yesterday, result.yesterdayLogs, function (cost) {
                    that.setState({
                        energy: that.state.energy + cost,
                        energyCost: 0
                    });
                    that.yesterDaySleepLog = result.sleepLog;
                    that.todayWakeLog = logs.filter(function (log) {
                        return log.signs.indexOf('wake') >= 0;
                    })[0];
                    that.updateEnergy(result.date, logs);
                });
            } else {
                that.updateEnergy(result.date, logs);
            }
        });
    },

    getLogContent: function () {
        var deferred = Q.defer();
        var that = this;
        var nowDate = new Moment().format('YYYY-MM-DD');
        var currentDay = this.currentDay.format('YYYY-MM-DD');
        DataAPI.getLogContent(currentDay)
            .then(function (content) {
                var logs = TrackerHelper.getLogs(content, currentDay);
                var sleepLog = logs.filter(function (log) {
                    return log.signs.indexOf('sleep') >= 0;
                });
                if (_.isEmpty(sleepLog) || _isDoingLog(currentDay, sleepLog[0])) {
                    deferred.resolve({
                        date: currentDay,
                        content: content
                    });
                } else{
                    that.currentDay = new Moment(nowDate);
                    DataAPI.getLogContent(nowDate).then(function (newContent) {
                        deferred.resolve({
                            content: newContent,
                            date: nowDate,
                            yesterday: currentDay,
                            yesterdayLogs: logs,
                            sleepLog: sleepLog[0],
                            moveToNextDay: true
                        });
                    });
                }
            });

        return deferred.promise;
    },

    _calculateEnergyCost: function (date, logs) {
        if (_.isEmpty(logs)) {return 0;}
        var energySettings = Settings.getEnergySettings();
        var sum = logs.reduce(function (sum, log) {
            var value = val(log);
            console.log(log.origin, value);
            return sum + value;
        }, 0);

        if (this.yesterDaySleepLog && this.todayWakeLog) {
            sum += energySettings.sleepValue * (new Moment(this.todayWakeLog.end).diff(this.yesterDaySleepLog.start, 'minutes')) / 60;
        }

        return sum;

        function val(log) {
            var value = 0;
            var isDoingLog = _isDoingLog(date, log);
            var configs = energySettings.configs;
            var tags = log.tags || [];
            var classes = log.classes || [];
            var classConfigs, filterConfigs;
            if (_.isEmpty(tags) && _.isEmpty(classes)) {
                return energySettings.normalCost / 60 * log.len;
            }
            if (!_.isEmpty(classes)) {
                classConfigs = configs.filter(function (config) {
                    return _.intersection(config.classes, classes).length > 0;
                });
                configs = classConfigs;
            }
            if (!_.isEmpty(tags)) {
                filterConfigs = configs.filter(function (config) {
                    return _.intersection(tags, config.tags).length > 0;
                });
                if (_.isEmpty(filterConfigs) && !_.isEmpty(classConfigs)) {
                    configs = classConfigs.filter(function (config) {
                        return _.isEmpty(config.tags);
                    });
                } else {
                    configs = filterConfigs;
                }
            } else {
                configs = classConfigs.filter(function (config) {
                    return _.isEmpty(config.tags);
                });
            }
            if (!_.isEmpty(configs)) {
                value = configs[0].value;
            }
            if (isDoingLog) {
                return value / 60 * (new Moment().diff(log.start, 'minute'));
            } else {
                return value / 60 * log.len;
            }
        }
    }
});



function _isDoingLog(date, log) {
    var timeStr = TrackerHelper.getTimeStr(log.origin);
    if (timeStr && timeStr.indexOf('~') >= 0) {
        var time = TrackerHelper.getTimeSpan(log.origin, {date: date, patchEnd: false});
        return time.start && !time.end;
    } else {
        return false;
    }
}