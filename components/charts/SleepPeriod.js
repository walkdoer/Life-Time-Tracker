
'use strict';
var React = require('react');
var R = React.DOM;
var _ = require('lodash');
var extend = require('extend');

var chart = require('./chart');
var className = 'ltt_c-sleepPeriod';
var DataAPI = require('../../utils/DataAPI.js');
var sleepPeriodConvertor = require('../../convertors/sleepPeriod');


var SleepPeriod = React.createClass({

    displayName: 'sleepPeriod',

    getDefaultProps: function () {
        return {
            url : '/sleepPeriods'
        };
    },

    getInitialState: function () {
        return {
            msg: 'loading'
        };
    },

    componentDidMount: function () {
        var that = this;
        var params = extend({}, _.pick(this.props, ['start', 'end']));
        DataAPI.get(this.props.url, params)
            .then(function(result) {
                if (!that.isMounted()) {
                    return;
                }
                that.setState({msg: ''});
                chart.timeline({
                    title: that.props.title,
                    $el: $(that.getDOMNode()),
                    data: sleepPeriodConvertor.dispose(result)
                });
            }).catch(function (err) {
                console.error(err.stack);
                throw err;
            });
    },

    render: function() {
        return <div className="ltt_c-sleepPeriod"></div>
    }

});

module.exports = SleepPeriod;
