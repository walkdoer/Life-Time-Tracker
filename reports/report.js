/**
 * @jsx React.DOM
 */

var React = require('react');
var DateRangePicker = require('../components/DateRangePicker');
var Moment = require('moment');
var Q = require('q');
var _ = require('lodash');
var remoteStorage = require('../components/storage.remote');
var State = require('react-router').State;
/* Reports */
var DayReport = require('./DayReport');
var MultiDayReport = require('./MultiDayReport');
var Report404 = require('./Report404');

/** const **/
var DATE_FORMAT = 'YYYY-MM-DD';
var ReportMap = {
    overview: require('./Overview')
}

var Report = React.createClass({
    mixins: [State],
    render: function () {
        var id = this.getParams().reportId;
        var Content = ReportMap[id] || Report404;
        return (
            <div className={this.props.className}>
                <Content />
            </div>
        )
    }
});

module.exports = Report;
