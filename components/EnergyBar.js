var React = require('react');
var PureRenderMixin = require('react/addons').addons.PureRenderMixin;
var TrackerHelper = require('tracker/helper');
var _ = require('lodash');
var Moment = require('moment');
var Q = require('q');
var store = require('store2');

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
var SK_ORGINGAL_ENERGY = 'storage_key_original_energy';
var SK_SLEEP_ENERGY = 'storage_key_sleep_energy';
var TestDate = undefined;

module.exports = React.createClass({

    mixins: [PureRenderMixin, SetIntervalMixin],

    getInitialState: function () {
        var today = new Moment(TestDate);
        var orginEnergy = store(SK_ORGINGAL_ENERGY);
        var sleepSum = store(SK_SLEEP_ENERGY);
        if (orginEnergy && sleepSum) {
            var tmpArr = orginEnergy.split(',');
            var tmpArr2 = sleepSum.split(',');
            if (today.diff(tmpArr[0], 'day') === 0 && today.diff(tmpArr2[0], 'day') === 0) {
                this._originalEnergy =  parseInt(tmpArr[1]) + parseInt(tmpArr2[1]);
            } else {
                this._originalEnergy = Settings.getDefaultEnergy();
            }
        } else {
            this._originalEnergy = Settings.getDefaultEnergy();
        }
        if (sleepSum) {
            tmpArr2 = orginEnergy.split(',');
        }
        return {
            energy: this._originalEnergy,
            energyCost: 0
        };
    },

    render: function () {
        return (
            <Progress max={100} value={this.state.energy}/>
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
            this._originalEnergy += energyCost.sleepSum;
            this.setState({
                energy: this._originalEnergy + energyCost.sum,
                energyCost: energyCost
            }, function () {
                Settings.setEnergy(this.state.energy);
                callback && callback(energyCost);
            });
        }
    },

    componentDidMount: function () {
        var that = this;
        this.currentDay = new Moment(TestDate);
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
                that.currentDay = new Moment(result.date);
                //update yesterday's energy and move to next day
                that.updateEnergy(result.yesterday, result.yesterdayLogs, function (cost) {
                        store(SK_ORGINGAL_ENERGY, [result.date, that._originalEnergy = that.state.energy].join(','));
                        console.log('update enery to ' + that.state.energy);
                        that.yesterDaySleepLog = result.sleepLog;
                        that.todayWakeLog = logs.filter(function (log) {
                            return log.signs.indexOf('wake') >= 0;
                        })[0];
                        that.updateEnergy(result.date, logs, function (cost) {
                            store(SK_SLEEP_ENERGY, [result.date, cost.sleepSum].join(','));
                        });
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
        var trackedTime = 0;
        var wakeLog = null;
        var lastLog = null;
        var lastIndex = logs.length - 1;
        var sum = logs.reduce(function (sum, log, index) {
            var value = val(log);
            trackedTime += log.len;
            if (log.signs.indexOf('wake') >= 0) {
                wakeLog = log;
            }
            if (log.signs.indexOf('sleep') >= 0 || index === lastIndex) {
                lastLog = log;
            }
            console.log(log.origin, value);
            return sum + value;
        }, 0);
        if (wakeLog && lastLog) {
            unTrackedTime = new Moment(lastLog.end).diff(wakeLog.start, 'minutes') - trackedTime;
            sum += unTrackedTime * energySettings.normalCost / 60;
        }

        var sleepSum = 0;
        if (this.yesterDaySleepLog && this.todayWakeLog) {
            sleepSum = energySettings.sleepValue * (new Moment(this.todayWakeLog.end).diff(this.yesterDaySleepLog.start, 'minutes')) / 60;
        }

        console.log('sum:'+ sum);
        return {
            sum: sum,
            sleepSum: sleepSum
        };

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
            } else {
                return energySettings.normalCost / 60 * log.len;
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