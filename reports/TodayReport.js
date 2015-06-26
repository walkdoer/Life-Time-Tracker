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

/** Utils */
var DataAPI = require('../utils/DataAPI');


module.exports = React.createClass({

    render: function () {
        return (
            <div className="ltt_c-page ltt_c-report-TodayReport">
                <div className="Grid Grid--gutters Grid--stretch ltt_c-report-TodayReport-header">
                    <div className="Grid-cell">
                        <PieDetail className="chart" date={new Moment().startOf('day')} type="classes"/>
                    </div>
                </div>
            </div>
        );
    }
});