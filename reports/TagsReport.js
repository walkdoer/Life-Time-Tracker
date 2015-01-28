/**
 * @jsx React.DOM
 */

var React = require('react');
var _ = require('lodash');
var Moment = require('moment');

/** components */
var WordsCloud = require('../components/charts/WordsCloud');
var remoteStorage = require('../components/storage.remote');
var DateRangePicker = require('../components/DateRangePicker');
var LoadingMask = require('../components/LoadingMask');

/** constant */
var DATE_FORMAT = 'YYYY-MM-DD';


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
        return (
            <div className="ltt_c-report ltt_c-report-tags">
                <div>
                     <DateRangePicker ref="dateRange" start={this.state.startDate} end={this.state.endDate}
                            onDateRangeChange={this.onDateRangeChange}/>
                </div>
                {!_.isEmpty(this.state.tags) ? <WordsCloud words={this.adaptData(this.state.tags)}/> : null }
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
        remoteStorage.get('/api/stats', {
                start: new Moment(this.state.startDate).format(DATE_FORMAT),
                end: new Moment(this.state.endDate).format(DATE_FORMAT)
            })
            .then(function (result) {
                var data = result.data;
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

