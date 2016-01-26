/**
 * @jsx React.DOM
 */

var React = require('react');
var Moment = require('moment');
var _ = require('lodash');
var PureRenderMixin = require('react/addons').addons.PureRenderMixin;
var ReactBootStrap = require('react-bootstrap');
var numeral = require('numeral');
var Pie = require('../components/charts/Pie');

var config = require('../conf/config');
/** components */
var LoadingMask = require('../components/LoadingMask');
var PieDetail = require('../components/PieDetail');
var TimeConsumeRanking = require('../components/TimeConsumeRanking');
var Board = require('../components/Borad');
var WakeAndSleep = require('../components/WakeAndSleep');


/** Utils */
var DataAPI = require('../utils/DataAPI');
var Util = require('../utils/Util');

var noop = function () {};

var WeekPicker = React.createClass({

    getInitialState: function () {
        return {
            week: this.props.week,
            year: this.props.year
        };
    },

    getDefaultProps: function () {
        return {
            nextWeek: noop,
            prevWeek: noop
        };
    },

    render: function () {
        var className = 'ltt_c-WeekPicker';
        if (this.props.className) {
            className += ' ' + this.props.className;
        }
        var m = Moment().year(this.state.year).week(this.state.week);
        return <div className={className}>
            <div className="picker-content">
                <button className="prev" type="button" onClick={this.prevWeek} title="prev"><i className="fa fa-angle-double-left"></i></button>
                <input ref="weekInput" className="input-week" value={this._getDisplayValue()}/>
                <button className="next" type="button" onClick={this.nextWeek} title="next"><i className="fa fa-angle-double-right"></i></button>
            </div>
            <div className="display-range">
                <span>{m.startOf('week').format(Util.DATE_FORMAT)}</span>~<span>{m.endOf('week').format(Util.DATE_FORMAT)}</span>
            </div>
        </div>
    },

    _getDisplayValue: function() {
        return this.state.year + '-' + this.state.week;
    },

    prevWeek: function () {
        var prevWeek = this.state.week - 1;
        var year = this.state.year;
        if (prevWeek === 0) {
            year = this.state.year - 1;
            prevWeek = Moment().year(year).endOf('year').subtract(1, 'week').week();
        }
        this.setState({
            year: year,
            week: prevWeek
        }, function () {
            this.props.prevWeek(this.state.year, this.state.week);
        });
    },

    nextWeek: function () {
        var nextWeek = this.state.week + 1;
        var lastWeek = Moment().year(this.state.year).endOf('year').subtract(1, 'week').week();
        var year = this.state.year;
        if (nextWeek > lastWeek) {
            year = this.state.year + 1;
            nextWeek = 1;
        }
        this.setState({
            week: nextWeek,
            year: year
        }, function () {
            this.props.nextWeek(this.state.year, this.state.week);
        });
    }
})

var WeeklyReport = React.createClass({

    getInitialState: function () {
        return {
            week: this.props.week,
            year: this.props.year
        };
    },

    getDefaultProps: function () {
        var m = Moment();
        return {
            year: m.year(),
            week: m.week(), //default week is current date week
            showWeekPicker : true
        };
    },

    render: function () {
        var week = this.state.week;
        var year = this.state.year;
        var start = Moment().year(year).week(week).startOf('week').toDate();
        var end = Moment().year(year).week(week).endOf('week').toDate();
        return (
            <div className="ltt_c-report ltt_c-report-WeeklyReport">
                {this.props.showWeekPicker ?
                <div className="Grid Grid--gutters Grid--stretch ltt_c-report-WeeklyReport-board">
                    <div className="Grid-cell u-1of2">
                        <WeekPicker year={year} week={week} prevWeek={this.onPrevWeek} nextWeek={this.onNextWeek}/>
                    </div>
                </div>
                :
                null}
                <div className="Grid Grid--gutters Grid--stretch ltt_c-report-WeeklyReport-board">
                    <div className="Grid-cell">
                        <Board key={week} className="ltt-box-shadow" type="week" week={week}/>
                    </div>
                </div>
                <div>
                    <WakeAndSleep start={start} end={end} key={"ltt-week" + week}/>
                </div>
                <div className="Grid Grid--gutters Grid--stretch">
                    <div className="Grid-cell u-1of2">
                        <TimeConsumeRanking className="chart"
                            params={{
                                start: start,
                                end: end
                            }}/>
                    </div>
                    <div className="Grid-cell u-1of2">
                        
                    </div>
                </div>
            </div>
        );
    },

    onNextWeek: function (year, week) {
        this.setState({
            year: year,
            week: week
        });
    },

    onPrevWeek: function (year, week) {
        this.setState({
            year: year,
            week: week
        });
    }
});

module.exports = WeeklyReport;