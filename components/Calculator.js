var React = require('react');
var _ = require('lodash');
var DataAPI = require('../utils/DataAPI');
var Util = require('../utils/Util');
var Moment = require('moment');

module.exports = React.createClass({

    getInitialState: function () {
        return {
            num: 0
        };
    },

    render: function () {
        var type = this.props.type;
        var num = this.state.num;
        if (type === 'log.time') {
            num = Util.displayTime(this.state.num);
        }
        return <span className="ltt-time ltt_c-Calculator">{num}</span>
    },

    componentWillMount: function () {
        this.calculate();
    },

    calculate: function () {
        var params = _.extend({}, this.props.params);
        var type = this.props.type;
        params.start = new Moment(params.start).toDate(Util.DATE_FORMAT);
        params.end = new Moment(params.end).format(Util.DATE_FORMAT);
        if (type === 'task.count') {
            DataAPI.Task.load(params).then(function (tasks) {
                this.setState({
                    num: tasks.length
                });
            }.bind(this));
        } else if (type.indexOf('log.') === 0) {
            var handler;
            if (type === 'log.time') {
                params.sum = true;
                handler = function (result) {
                    result = result[0];
                    if (result) {
                        this.setState({
                            num: result.totalTime || result.count
                        });
                    }
                }.bind(this);
            } else if (type === 'log.count'){
                params.count = true;
                handler = function (result) {
                    if (result) {
                        this.setState({
                            num: result.count
                        });
                    }
                }.bind(this);
            }
            DataAPI.Log.load(params).then(handler);
        }
    }
});