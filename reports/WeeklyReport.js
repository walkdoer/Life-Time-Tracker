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


/** Utils */
var DataAPI = require('../utils/DataAPI');

var noop = function () {};

var WeekPicker = React.createClass({

    getInitialState: function () {
        return {
            week: this.props.value
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
        return <div className={className}>
            <button className="prev" type="button" onClick={this.prevWeek} title="prev"><i className="fa fa-angle-double-left"></i></button>
            <input ref="weekInput" className="input-week" value={this._getDisplayValue()}/>
            <button className="next" type="button" onClick={this.nextWeek} title="next"><i className="fa fa-angle-double-right"></i></button>
        </div>
    },

    _getDisplayValue: function() {
        return Moment().year() + '-' + this.state.week;
    },

    prevWeek: function () {
        this.setState({
            week: this.state.week - 1
        }, function () {
            this.props.prevWeek(this.state.week);
        });
    },

    nextWeek: function () {
        this.setState({
            week: this.state.week + 1
        }, function () {
            this.props.nextWeek(this.state.week);
        });
    }
})

var WeeklyReport = React.createClass({

    getInitialState: function () {
        return {
            week: this.props.week
        };
    },

    getDefaultProps: function () {
        return {
            week: new Moment().week(), //default week is current date week
            showWeekPicker : true
        };
    },

    render: function () {
        var week = this.state.week;
        return (
            <div className="ltt_c-report ltt_c-report-WeeklyReport">
                {this.props.showWeekPicker ?
                <div className="Grid Grid--gutters Grid--stretch ltt_c-report-WeeklyReport-board">
                    <div className="Grid-cell u-1of5">
                        <WeekPicker value={week} prevWeek={this.onPrevWeek} nextWeek={this.onNextWeek}/>
                    </div>
                </div>
                :
                null}
                <div className="Grid Grid--gutters Grid--stretch ltt_c-report-WeeklyReport-board">
                    <div className="Grid-cell">
                        <Board key={week} className="ltt-box-shadow" type="week" week={week}/>
                    </div>
                </div>
                <div className="Grid Grid--gutters Grid--stretch">
                    <div className="Grid-cell u-1of2">
                        <TimeConsumeRanking className="chart"
                            params={{
                                start: Moment().week(week).startOf('week').toDate(),
                                end: Moment().week(week).endOf('week').toDate()
                            }}/>
                    </div>
                    <div className="Grid-cell u-1of2">
                        
                    </div>
                </div>
            </div>
        );
    },

    onNextWeek: function (week) {
        this.setState({
            week: week
        });
    },

    onPrevWeek: function (week) {
        this.setState({
            week: week
        });
    }
});

module.exports = WeeklyReport;