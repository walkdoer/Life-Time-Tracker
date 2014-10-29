/**
 * 饼图
 */
define(function(require) {
    'use strict';
    var React = require('react');
    var R = React.DOM;
    var chart = require('./chart');
    var className = 'ltt_c-sleepPeriod';
    var remoteStorage = require('./storage.remote');
    var LoadIndicator = require('./loadIndicator');
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
                    chart.timeline({
                        title: that.props.title,
                        $el: $(that.getDOMNode()),
                        data: pieConvertor.dispose(result.data)
                    });
                });
        },
        render: function() {
            return R.div({className: className}, LoadIndicator());
        }
    });


    

    return Pie;
});