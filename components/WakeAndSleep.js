/**
 * @jsx React.DOM
 */

var React = require('react');
var Moment = require('moment');
var _ = require('lodash');
var PureRenderMixin = require('react/addons').addons.PureRenderMixin;
var ReactBootStrap = require('react-bootstrap');
var numeral = require('numeral');
var DataAPI = require('../utils/DataAPI');
var Util = require('../utils/Util');


var WakeAndSleep = React.createClass({

    getInitialState: function () {
        return {
            meanSleep: null,
            meanWake: null
        };
    },

    render: function () {
        var meanWake = this.state.meanWake;
        var meanSleep = this.state.meanSleep;
        return <div class="wake-sleep">
                <p> 平均起床时间：{meanWake ? Moment(meanWake).format('HH:mm') : null}</p>
                <p> 平均睡眠时间：{meanSleep ? Moment(meanSleep).format('HH:mm') : null}</p>
        </div>
    },

    componentWillMount: function () {
        this.loadSleepWakeData();
    },

    loadSleepWakeData: function () {
        var that = this;
        var mStart = new Moment(this.props.start);
            mEnd = new Moment(this.props.end);
        DataAPI.Stat.wakeAndSleep({
            start: mStart.format(Util.DATE_FORMAT),
            end: mEnd.format(Util.DATE_FORMAT),
            group: 'type'
        }).then(function (res) {
            var wakeData = res.wake || [];
            var sleepData = res.sleep || [];
            var wakeLen = wakeData.length;
            var sleepLen = sleepData.length;
            var wakeSum = wakeData.reduce(function (t, wt) {
                var mt = new Moment(wt.start);
                var base = Moment(wt.date).startOf('day');
                return t + mt.diff(base, 'minute');
            }, 0);
            meanWake =  new Moment().startOf('day').add(wakeSum / wakeLen, 'minute');
            var sleepSum = sleepData.reduce(function (t, st) {
                var mt = new Moment(st.start);
                var base = Moment(st.date).endOf('day');
                return t + mt.diff(base, 'minute');
            }, 0);
            meanSleep =  new Moment().endOf('day').add(sleepSum / sleepLen, 'minute');
            that.setState({
                wakeData: wakeData,
                sleepData: sleepData,
                meanWake: meanWake.toDate(),
                meanSleep: meanSleep.toDate()
            });
        });
    }
});

module.exports = WakeAndSleep;