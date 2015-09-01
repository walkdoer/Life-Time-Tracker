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


var WeeklyReport = React.createClass({

    getDefaultProps: function () {
        return {
            week: new Moment().week(), //default week is current date week
            showDatePicker : true
        };
    },

    render: function () {
        var week = this.props.week;
        return (
            <div className="ltt_c-report ltt_c-report-WeeklyReport">
                <div className="Grid Grid--gutters Grid--stretch ltt_c-report-WeeklyReport-board">
                    <div className="Grid-cell">
                        <Board type="week" week={this.props.week}/>
                    </div>
                </div>
                <div className="Grid Grid--gutters Grid--stretch">
                    <div className="Grid-cell u-1of2">
                        <TimeConsumeRanking className="chart"
                            start={Moment().week(this.props.week).startOf('week').toDate()}
                            end={Moment().week(this.props.week).endOf('week').toDate()} />
                    </div>
                    <div className="Grid-cell u-1of2">
                        
                    </div>
                </div>
            </div>
        );
    }
});

module.exports = WeeklyReport;