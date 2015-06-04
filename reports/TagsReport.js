/**
 * @jsx React.DOM
 */

var React = require('react');
var _ = require('lodash');
var Moment = require('moment');

/** components */
var WordsCloud = require('../components/charts/WordsCloud');
var DateRangePicker = require('../components/DateRangePicker');
var LoadingMask = require('../components/LoadingMask');
var Bar = require('../components/charts/Bar');

/** constant */
var DATE_FORMAT = 'YYYY-MM-DD';

/** Utils */
var DataAPI = require('../utils/DataAPI');

module.exports = React.createClass({

    getInitialState: function () {
        return {
            startDate: new Moment().subtract(1, 'month').toDate(),
            endDate: new Moment().toDate(),
            tags: [],
            loaded: false
        };
    },

    render: function () {
        var  tagBarHeight = this.state.tags.length * 30;
        return (
            <div className="ltt_c-report ltt_c-report-tags">
                <div>
                     <DateRangePicker ref="dateRange" start={this.state.startDate} end={this.state.endDate}
                            onDateRangeChange={this.onDateRangeChange}/>
                </div>
                {!_.isEmpty(this.state.tags) ? <WordsCloud words={this.adaptData(this.state.tags)}/> : null }
                <div style={{height: tagBarHeight}}>
                    <Bar data={this.state.tags}/>
                </div>
                <LoadingMask loaded={this.state.loaded}/>
            </div>
        );
    },

    adaptData: function (tags) {
        return (tags || []).map(function (tag) {
            return {
                text: tag.label,
                size: tag.count
            };
        })
    },

    componentDidMount: function () {
        this.loadTags();
    },

    onDateRangeChange: function (start, end) {
        this.setState({
            startDate: start,
            endDate: end,
            loaded: false
        }, function () {
            this.loadTags();
        });

    },

    loadTags: function () {
        var that = this;
        DataAPI.Stat.load({
                start: new Moment(this.state.startDate).format(DATE_FORMAT),
                end: new Moment(this.state.endDate).format(DATE_FORMAT)
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

