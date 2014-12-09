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

var chartHelper = require('../components/charts/helper');
//charts
var Pie = require('../components/charts/Pie');
var Column = require('../components/charts/Column');
var Line = require('../components/charts/Line');
var Bar = require('../components/charts/Bar');
var setAndCompareData = require('../components/charts/setAndCompareData');
var SpiderWeb = require('../components/charts/SpiderWeb');

var Report = React.createClass({

    mixins: [setAndCompareData],
    chartDatas: {
        chart_logClassTime: 'classTime',
        chart_tagTime: function (data) { return data.tagTime.slice(0, 20); },
        chart_sitStandTime: function (data) { return data.sitPerspective;},
        chart_categoryTime: function (data) { return data.categoryPerspective.categoryTime; },
        chart_projectTime: function (data) { return  data.projectTime.slice(0,10);},
    },

    compareChartRefs: [{
        refName: "chart_categoryTime",
        getData: function (data) {
            return data.categoryPerspective.categoryTime;
        }
    }, {
        refName: "chart_tagTime",
        getData: 'tagTime'
    }, {
        refName: "chart_projectTime",
        getData: function (data) {
            return data.projectTime.slice(0, 20);
        }
    }],

    render: function () {
        return (
            <div className="ltt_c-report-day">
                <div className="row ltt-row">
                    <SpiderWeb className={col4} ref="chart_logClassTime" categories={['NT', 'WK', 'STU', 'TK', 'BRK', 'SPR']}/>
                    <Column title="Tag Time" className={col8} ref="chart_tagTime" legend={false}/>
                </div>
                <div className="row ltt-row">
                    <Bar className={col4} ref="chart_categoryTime" legend={false}/>
                    <Column title="Top 10 Project"
                        className={col8}
                        ref="chart_projectTime"
                        legend={false} />
                </div>
                <div className="row ltt-row">
                    <Pie className={col4} ref="chart_sitStandTime" />
                </div>
            </div>
        );
    }
});

module.exports = Report;
