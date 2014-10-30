/**
 * 饼图
 */
define(function(require) {
    'use strict';
    var React = require('react');
    var R = React.DOM;
    var chart = require('./chart');
    var className = 'ltt_c-sleepPeriod';
    var remoteStorage = require('../storage.remote');
    var LoadIndicator = require('../loadIndicator');
    var classesConvertor = require('../convertors/classes');
    var Pie = React.createClass({
        displayName: 'pie',
        getInitialState: function () {
            return {
                msg: 'loading'
            };
        },
        componentDidMount: function () {
            var that = this;
            remoteStorage.get(this.props.url)
                .then(function(result) {
                    that.setState({msg: ''});
                    chart.pie({
                        title: that.props.title,
                        $el: $(that.getDOMNode()),
                        data: classesConvertor.dispose(result.data)
                    });
                });
        },
        render: function() {
            return R.div({className: className}, LoadIndicator());
        }
    });

    return Pie;
});