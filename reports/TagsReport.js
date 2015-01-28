/**
 * @jsx React.DOM
 */

var React = require('react');
var _ = require('lodash');
var Moment = require('moment');

/** components */
var WordsCloud = require('../components/charts/WordsCloud');
var remoteStorage = require('../components/storage.remote');

/** constant */
var DATE_FORMAT = 'YYYY-MM-DD';


module.exports = React.createClass({

    getInitialState: function () {
        return {
            start: new Moment().subtract(1, 'month').toDate(),
            end: new Moment().toDate(),
            tags: []
        };
    },

    render: function () {
        return (
            <div className="ltt_c-report ltt_c-report-tags">
                <p>tags</p>
                {!_.isEmpty(this.state.tags) ? <WordsCloud words={this.adaptData(this.state.tags)}/> : null }
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
        var that = this;
        remoteStorage.get('/api/stats', {
                start: new Moment(this.state.start).format(DATE_FORMAT),
                end: new Moment(this.state.end).format(DATE_FORMAT)
            })
            .then(function (result) {
                var data = result.data;
                that.setState({
                    tags: data.tagTime
                });
            })
            .catch(function (err) {
                console.error(err.stack);
            });
    }

});

