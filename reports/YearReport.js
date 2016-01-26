/**
 * @jsx React.DOM
 */

var React = require('react');
var Moment = require('moment');
var _ = require('lodash');
var PureRenderMixin = require('react/addons').addons.PureRenderMixin;
var ReactBootStrap = require('react-bootstrap');
var numeral = require('numeral');

var LoadingMask = require('../components/LoadingMask');
var DataAPI = require('../utils/DataAPI');
var Util = require('../utils/Util');


/**charts*/
var WordsCloud = require('../components/charts/WordsCloud');
var LogClassPie = require('../components/LogClassPie');
var RankBar = require('../components/RankBar');



var YearReport = React.createClass({

    getInitialState: function () {
        return {
            year: new Moment().subtract(1, 'year').year()
        };
    },

    render: function () {
        var startOfYear = new Moment().year(this.state.year).startOf('year'),
            endOfYear = new Moment().year(this.state.year).endOf('year');
        return (
            <div className="ltt_c-report ltt_c-report-YearReport">
                <h1 className="title">{this.state.year}年度报告</h1>
                <h2> 基本生活数据 </h2>
                <WakeAndSleep start={startOfYear} end={endOfYear}/>
                <h4>各个类别的时间比例</h4>
                <div className="Grid Grid--gutters Grid--stretch">
                    <div className="Grid-cell u-1of2">
                        <LogClassPie type="classes"
                        title="时间分类饼图"
                        backgroundColor="rgba(255, 255, 255, 0.1)"
                        start={startOfYear}
                        end={endOfYear}
                        compare={false}
                        legend={true}/>
                    </div>
                    <div className="Grid-cell u-1of2">
                        <RankBar className="chart"
                            type="classes"
                            backgroundColor="rgba(255, 255, 255, 0.1)"
                            params={{
                                start: startOfYear.toDate(),
                                end: endOfYear.toDate()
                            }}/>
                    </div>
                </div>
                <h4>Tag标签图</h4>
                <YearTag year={this.state.year}/>
            </div>
        );
    }
});

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
                console.log('wake:' + mt.diff(base, 'minute'));
                return t + mt.diff(base, 'minute');
            }, 0);
            meanWake =  new Moment().startOf('day').add(wakeSum / wakeLen, 'minute');
            var sleepSum = sleepData.reduce(function (t, st) {
                var mt = new Moment(st.start);
                var base = Moment(st.date).endOf('day');
                console.log('sleep:' + mt.diff(base, 'minute'));
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

var YearTag = React.createClass({

    getInitialState: function () {
        return {
            tags: [],
            loaded: false
        };
    },

    render: function () {
        return <div className="tag-cloud">
            <WordsCloud words={this.adaptData(this.state.tags)}/> : null }
            <LoadingMask loaded={this.state.loaded}/>
        </div>
    },

    componentDidMount: function () {
        this.loadTagData();
    },

    adaptData: function (tags) {
        return (tags || []).map(function (tag) {
            return {
                text: tag.label,
                size: tag.count
            };
        })
    },

    loadTagData: function () {
        var that = this;
        DataAPI.Stat.load({
            start: new Moment().year(this.props.year).startOf('year').format(Util.DATE_FORMAT),
            end: new Moment().year(this.props.year).endOf('year').format(Util.DATE_FORMAT)
        })
        .then(function (data) {
            that.setState({
                loaded: true,
                tags: data.tagTime
            });
        })
        .catch(function (err) {
            console.error(err.stack);
        });
    }
});



module.exports = YearReport;