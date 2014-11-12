/**
 * @jsx React.DOM
 */

var React = require('react');
var DateRangePicker = require('../components/DateRangePicker');
var Moment = require('moment');
var Q = require('q');
var remoteStorage = require('../components/storage.remote');
var col4 = 'col-xs-6 col-md-4',
    col8 = 'col-xs-12 col-md-8',
    col3 = 'col-xs-6 col-md-3';

//charts
var Pie = require('../components/charts/Pie');
var Column = require('../components/charts/Column');
var Bar = require('../components/charts/Bar');
var Report = React.createClass({

    getUrl: function () {
        var mStart = new Moment(this.start),
            mEnd = new Moment(this.end);
        if (mStart.diff(mEnd, 'day') === 0) {
            return '/api/stats/' + (mStart.format('YYYY/MM/DD'));
        } else {
            return '/api/stats?start=' + mStart.format('YYYY-MM-DD') +
                        '&end=' + mEnd.format('YYYY-MM-DD');
        }
    },

    render: function () {
        return (
            <div className="ltt_c-page-reports">
                <DateRangePicker onChange={this.renderReport} className="ltt_c-page-reports-dateRange"/>
                <div className="row ltt-row">
                    <Pie className={col4} ref="logClassTime" />
                    <Column className={col8} ref="tagTime" />
                </div>
                <div className="row ltt-row">
                    <Bar className={col4} ref="categoryTime" />
                    <Column className={col8} ref="projectTime" />
                </div>
            </div>
        );
    },

    renderReport: function (start, end) {
        var that = this;
        this.setDateRange(start, end);
        this.loadReportData()
            .then(function (result) {
                var statData = result.data;
                that.refs.logClassTime.setData(statData.classTime);
                that.refs.tagTime.setData(statData.tagTime);
                that.refs.categoryTime.setData(statData.categoryPerspective.categoryTime);
                that.refs.projectTime.setData(statData.projectTime);
            });
    },

    setDateRange: function (start, end) {
        this.start = start;
        this.end = end;
    },

    loadReportData: function () {
        var def = Q.defer();
        var url = this.getUrl();
        remoteStorage.get(url)
            .then(function (result) {
                def.resolve(result);
            })
            .catch(function (err) {
                def.reject(err);
            });
        return def.promise;
    }

});

module.exports = Report;
