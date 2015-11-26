/**
 * @jsx React.DOM
 */
'use strict'

var React = require('react');
var _ = require('lodash');
var Moment = require('moment');

/** components */
var WordsCloud = require('./WordsCloud');
var LoadingMask = require('../LoadingMask');


/** constant */
var DATE_FORMAT = 'YYYY-MM-DD';

/** Utils */
var DataAPI = require('../../utils/DataAPI');

var TagCloud = React.createClass({

    getInitialState: function () {
        return {
            tags: [],
            loaded: false
        };
    },

    render: function () {
        return (
            <div className="ltt_c-chart-TagCloud" style={this.props.style}>
                {!_.isEmpty(this.state.tags) ? <WordsCloud words={this.adaptData(this.state.tags)}
                    height={this.props.height} width={this.props.width}/> : null }
                <LoadingMask loaded={this.state.loaded}/>
            </div>
        );
    },

    adaptData: function (tags) {
        return (tags || []).map(function (tag) {
            return {
                text: tag._id,
                size: tag.totalTime
            };
        })
    },

    componentDidMount: function () {
        this.loadTags();
    },

    loadTags: function () {
        var that = this;
        DataAPI.Log.load({
            start: new Moment(this.props.start).format(DATE_FORMAT),
            end: new Moment(this.props.end).format(DATE_FORMAT),
            group: "tags",
            sum: true
        })
        .then(function (data) {
            that.setState({
                loaded: true,
                tags: data
            });
        })
        .catch(function (err) {
            console.error(err.stack);
        });
    }
});


module.exports = TagCloud;