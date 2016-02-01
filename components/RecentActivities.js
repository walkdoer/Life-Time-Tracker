var React = require('react');
var _ = require('lodash');
var Log = require('./Log');
var DataAPI = require('../utils/DataAPI');


module.exports = React.createClass({
    getInitialState: function  () {
        return {
            error: false,
            activies: []
        };
    },

    render: function () {
        var error = null;
        if (this.state.error) {
            error = <div className="error" style={{padding: 10}}>load activities failed</div>;
        }
        return (
        <div>
            {error}
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
        var that = this;
        if (!log) {
            return;
        }
        var params = {};
        var task = log.task;
        var tags = log.tags;
        var projects = log.projects;
        var version = log.version;
        var classes = log.classes;
        if (task && task.name) {
            params.task = task.name
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