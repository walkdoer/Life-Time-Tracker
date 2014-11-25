/**
 * @jsx React.DOM
 */

var React = require('react');
var Moment = require('moment');
var Q = require('q');
var _ = require('lodash');
var remoteStorage = require('../components/storage.remote');
var col4 = 'col-xs-6 col-md-4',
    col8 = 'col-xs-12 col-md-8',
    colFull = 'col-xs-12 col-md-12',
    col3 = 'col-xs-6 col-md-3';

//charts
var Pie = require('../components/charts/Pie');
var Column = require('../components/charts/Column');
var Line = require('../components/charts/Line');
var Bar = require('../components/charts/Bar');
var Report = React.createClass({

    render: function () {
        return (
            <div className="ltt_c-report-day">
                <div className="row ltt-row">
                    <Pie className={col4} ref="logClassTime" />
                    <Column className={col8} ref="tagTime" />
                </div>
                <div className="row ltt-row">
                    <Bar className={col4} ref="categoryTime" />
                    <Column title="Top 10 Project" className={col8} ref="projectTime" />
                </div>
                <div className="row ltt-row">
                    <Pie className={col4} ref="sitStandTime" />
                    <Bar className={col4} ref="meanLogClassTime" />
                    <Bar className={col4} ref="meanProjectTime" />
                </div>
            </div>
        );
    },


    setData: function (statData) {
        var that = this;
        that.refs.logClassTime.setData(statData.classTime);
        that.refs.sitStandTime.setData(statData.sitPerspective);
        that.refs.tagTime.setData(statData.tagTime.slice(0, 20));
        that.refs.categoryTime.setData(statData.categoryPerspective.categoryTime);
        that.refs.projectTime.setData(statData.projectTime.slice(0,10));
        if (statData.meanPerspective) {
            that.refs.meanLogClassTime.setData(statData.meanPerspective.classes);
            that.refs.meanProjectTime.setData(statData.meanPerspective.projects);
        }
    },


    compareData: function (statDatas) {
        var categoryTime = [],
            tagTime = [];
        statDatas.map(function (statData) {
            var day = statData.days[0];
            categoryTime.push({
                name: day.date,
                values: day.categoryPerspective.categoryTime
            });
            tagTime.push({
                name: day.date,
                values: day.tagTime.slice(0, 20)
            });
        });

        this.refs.categoryTime.compareData(categoryTime);
        this.refs.tagTime.compareData(tagTime);
    }
});

module.exports = Report;
