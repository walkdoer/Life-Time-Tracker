var React = require('react');
var PureRenderMixin = require('react/addons').addons.PureRenderMixin;
var TrackerHelper = require('tracker/helper');
var _ = require('lodash');
var Moment = require('moment');
var Q = require('q');
var store = require('store2');
require('../libs/jquery.peity.js');

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
var SK_REMAINDER = 'storage_key_remainder';
var DATE_FORMAT = 'YYYY-MM-DD';
var SPLITTER = ',';

module.exports = React.createClass({

    mixins: [/*PureRenderMixin,*/ SetIntervalMixin],

    getInitialState: function () {
        return {
            energy: 0
        };
    },

    render: function () {
        return (
            <div className="ltt_c-EnergyBar">
                <Progress max={100} value={this.state.energy}/>
                <EnergyLine value={this.state.energy}/>
            </div>
        );
    },

    componentWillMount: function () {
        Bus.addListener(EVENT.LOG_CHANGE, this.onLogContentChange);
    },


    componentWillUnmount: function () {
        Bus.removeListener(EVENT.LOG_CHANGE, this.loadAppInfo);
        //Bus.removeListener(EVENT.CHECK_SYNC_STATUS, this.checkSyncStatus);
    },

    onLogContentChange: function (date, content) {
        var that = this;
        if (new Moment().diff(date, 'day') === 0) {
            this.getEnergy(content).then(function (energy) {
                that.setState({
                    energy: energy
                });
            });
        }
    },

    componentDidMount: function () {
        var that = this;
        if (this.intervalId) {
            this.clearInterval(this.intervalId);
        }
        this.updateEnergy();
        this.intervalId = this.setInterval(function () {
            that.updateEnergy();
        }, 60000);
    },

    updateEnergy: function () {
        var that = this;
        this.getEnergy().then(function (energy) {
            that.setState({
                energy: energy
            });
        });
    },

    getEnergy: function (content) {
        var that = this;
        var todayDate = new Moment().format(DATE_FORMAT);
        return this._getEnery(todayDate, content).then(function (value) {
            if (value === 'recalculate') {
                return that._getEnery(new Moment(todayDate).subtract(1, 'day').format(DATE_FORMAT), content);
            } else {
                return value;
            }
        });
    },

    _getEnery: function (todayDate, content) {
        var deferred = Q.defer();
        var that = this;
        var energySettings = Settings.getEnergySettings();
        var yesterdayDate = new Moment(todayDate).subtract(1, 'day').format(DATE_FORMAT);
        var defaultEnergy = Settings.getDefaultEnergy();
        DataAPI.getLogContent(yesterdayDate).then(function (yesterdayContent) {
            var yesterdayLogs = TrackerHelper.getLogs(yesterdayContent, yesterdayDate);
            var energyValue, yesterdaySleepLog;
            if (!_.isEmpty(yesterdayLogs)) { //if yesterday has logs, then calculate it's cost and getToday's initial value
                yesterdaySleepLog = getSleepLog(yesterdayDate, yesterdayLogs);
                if (!yesterdaySleepLog) {
                    return deferred.resolve('recalculate');
                }
                if (content !== undefined) {
                    getTodayEnergy(content);
                } else {
                    DataAPI.getLogContent(todayDate).then(getTodayEnergy);
                }
            }
            function getTodayEnergy(content) {
                var logs = TrackerHelper.getLogs(content, todayDate);
                var remainder = that._getYesterDayEnergyRemainder(todayDate);
                var energyCost = that._calculateEnergyCost(todayDate, logs);
                var todaySleepLog = getSleepLog(todayDate, logs);
                var initEnergy = defaultEnergy;
                if (yesterdaySleepLog && remainder !== null) { //if has sleep log, then get energy remainder of yesterday
                    initEnergy = remainder;
                }
                var sleepSupply = 0;
                wakeLog = getWakeLog(logs);
                if (wakeLog && remainder !== null) {
                    sleepSupply = energySettings.sleepValue * (new Moment(wakeLog.end).diff(yesterdaySleepLog.start, 'minutes')) / 60;
                } else if (yesterdaySleepLog && !wakeLog) {
                    sleepSupply = energySettings.sleepValue * (new Moment().diff(yesterdaySleepLog.start, 'minutes')) / 60;
                }
                var result = initEnergy + sleepSupply + energyCost;
                if (todaySleepLog) {
                    store(SK_REMAINDER, [todayDate, result].join(SPLITTER));
                }
                deferred.resolve(result);
            }
        });
        return deferred.promise;
    },

    _getYesterDayEnergyRemainder: function (date) {
        var yesterdayDate = new Moment(date).subtract(1, 'day').format(DATE_FORMAT);
        var remainder = null;
        var remainderConfig = store(SK_REMAINDER);
        if (remainderConfig) {
            tmpArr = remainderConfig.split(SPLITTER);
            if (yesterdayDate === new Moment(tmpArr[0]).format(DATE_FORMAT)) {
                remainder = parseInt(tmpArr[1], 10);
            }
        }
        return remainder;
    },


    _calculateEnergyCost: function (date, logs) {
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
            //console.log(log.origin, value);
            return sum + value;
        }, 0);
        if (wakeLog && lastLog) {
            unTrackedTime = new Moment(lastLog.end).diff(wakeLog.start, 'minutes') - trackedTime;
            sum += unTrackedTime * energySettings.normalCost / 60;
        }

        console.log('sum:'+ sum);
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


var EnergyLine = React.createClass({

    getInitialState: function () {
        return {
            data: [this.props.value]
        };
    },


    render: function () {
        return <span class="ltt_c-EnergyLine">{this.state.data.join(',')}</span>
    },

    componentWillReceiveProps: function (nextProps) {
        var data = this.state.data;
        if (data.length === 60) {
            values.shift();
        }
        data.push(nextProps.value);
        this.setState({
            data: data
        }, function () {
            this.update();
        });
    },

    componentDidMount: function () {
        this.plot();
    },

    update: function () {
        this.chart.change();
    },

    plot: function () {
        this.chart = $(this.getDOMNode()).peity("line", { width: 64 });
    }
});

function getSleepLog(date, logs) {
    var log = logs.filter(function (log) {
        return log.signs.indexOf('sleep') >= 0;
    })[0];
    if (log && !_isDoingLog(date, log)) {
        return log;
    }
}

function getWakeLog(logs) {
    return logs.filter(function (log) {
        return log.signs.indexOf('wake') >= 0;
    })[0];
}

function _isDoingLog(date, log) {
    var timeStr = TrackerHelper.getTimeStr(log.origin);
    if (timeStr && timeStr.indexOf('~') >= 0) {
        var time = TrackerHelper.getTimeSpan(log.origin, {date: date, patchEnd: false});
        return time.start && !time.end;
    } else {
        return false;
    }
}