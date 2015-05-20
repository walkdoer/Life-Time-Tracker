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

    updateEnergy: function (date, content) {
        if (new Moment().diff(date, 'day') >= 0) {
            var energyCost = this._calculateEnergyCost(date, content);
            this.setState({
                energyCost: energyCost
            });
        }
    },

    componentDidMount: function () {
        var that = this;
        this.currentDay = new Moment();
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
            that.updateEnergy(result.date, result.content);
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
                if (_.isEmpty(sleepLog)) {
                    deferred.resolve({
                        date: currentDay,
                        content: content
                    });
                } else {
                    if (currentDay === nowDate) {
                        return deferred.resolve({
                            content: content,
                            date: currentDay
                        });
                    }
                    that.currentDay = new Moment(nowDate);
                    DataAPI.getLogContent(nowDate).then(function (content) {
                        deferred.resolve({
                            content: content,
                            date: nowDate
                        });
                    });
                }
            });

        return deferred.promise;
    },

    _calculateEnergyCost: function (date, content) {
        if (!content) {return;}
        var energySettings = Settings.getEnergySettings();
        console.log(energySettings);
        var logs = TrackerHelper.getLogs(content, date);
        var sum = logs.reduce(function (sum, log) {
            var value = val(log);
            console.log(log.origin, value);
            return sum + value;
        }, 0);

        return sum;

        function val(log) {
            var value = 0;
            var isDoingLog = _isDoingLog(log);
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

        function _isDoingLog(log) {
            var timeStr = TrackerHelper.getTimeStr(log.origin);
            if (timeStr && timeStr.indexOf('~') >= 0) {
                var time = TrackerHelper.getTimeSpan(log.origin, {date: date, patchEnd: false});
                return time.start && !time.end;
            } else {
                return false;
            }
        }
    }
});