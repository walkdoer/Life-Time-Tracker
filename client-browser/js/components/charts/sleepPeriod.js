define(function(require) {
    'use strict';
    var React = require('react');
    var R = React.DOM;
    var chart = require('./chart');
    var className = 'ltt_c-sleepPeriod';
    var remoteStorage = require('app/components/storage.remote');
    var sleepPeriodConvertor = require('app/components/convertors/sleepPeriod');
    var LoadIndicator = require('app/components/loadIndicator');
    var CalendarHeatMap = React.createClass({
        displayName: 'sleepPeriod',
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
                        data: sleepPeriodConvertor.dispose(result.data)
                    });
                });
        },
        render: function() {
            return R.div({className: className}, LoadIndicator());
        }
    });
    return CalendarHeatMap;
});
