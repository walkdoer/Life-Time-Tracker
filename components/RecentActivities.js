var React = require('react');
var _ = require('lodash');
var Log = require('./Log');
var DataAPI = require('../utils/DataAPI');
var LoadingMask = require('./LoadingMask');
var Util = require('../utils/Util');
var LogLine = require('./charts/LogLine');


module.exports = React.createClass({

    getDefaultProps: function () {
        return {
            progress: true
        };
    },
    getInitialState: function  () {
        return {
            error: false,
            loaded: false,
            activies: []
        };
    },

    render: function () {
        var error = null;
        if (this.state.error) {
            error = <div className="error" style={{padding: 10}}>load activities failed</div>;
        }
        var totalTime = this.state.activies.reduce(function (sum, log) {
            return sum + log.len;
        }, 0);
        return (
        <div style={{height: '100%'}} className="ltt_c-RecentActivities">
            <LoadingMask loaded={this.state.loaded}/>
            <div className="ltt-time">{Util.displayTime(totalTime)}</div>
            {error}
            {!_.isEmpty(this.state.activies) && this.props.progress ?
                <LogLine logs={this.state.activies} isSubTask={false} withProgress={true} name={"Progress trend line"}/>
                : null
            }
            {this.state.activies.map(function (log) {
                return <Log {... log}/>
            })}
        </div>
        );
    },


    componentDidMount: function () {
        this.loadActivities();
    },

    loadActivities: function () {
        var log = this.props.log;
        var params = this.props.params;
        var that = this;
        if (!log && !params) {
            return;
        }
        if (!params) {
            params = {};
            var task = log.task;
            var tags = log.tags;
            var projects = log.projects;
            var version = log.version;
            var classes = log.classes;
            if (task && task.name) {
                params.tasks = task.name
            }
            if (!_.isEmpty(tags)) {
                params.tags = tags.join(',');
            }
            if (!_.isEmpty(projects)) {
                params.projects = projects.map(function (proj) {
                    return proj.name;
                }).join(',');
            }
            if (version && version.name) {
                params.versions = version.name;
            }
            if (!_.isEmpty(classes)) {
                params.classes = classes.join(',');
            }
        }
        params = _.extend({
            sort: 'date: -1'
        }, params);
        params.populate = false;
        var promise = DataAPI.Log.load(params)
            .then(function (activies) {
                that.setState({
                    loaded: true,
                    activies: activies
                });
            }, function () {
                that.setState({
                    error: true
                });
            }).catch(function (err) {
                that.setState({
                    error: true
                });
            });
        return promise;
    }
});