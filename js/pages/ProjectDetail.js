/**
 * @jsx React.DOM
 */

var React = require('react');
var remoteStorage = require('../components/storage.remote');
var Moment = require('moment');
var Router = require('react-router');


var ProjectDetail = React.createClass({
    mixins: [Router.State],
    getInitialState: function () {
        return {
            loading: true
        };
    },

    render: function () {
        var loadingMsg;
        if (this.state.loading) {
            loadingMsg = (<div className="text-center"><i className="fa fa-spinner fa-spin"></i> loading project detail {this.getParams().messageId}</div>);
        }
        return (
            <div className="ltt_c-page ltt_c-page-projectDetail">
                {loadingMsg}
            </div>
        );
    },

    componentDidMount: function () { }

});

module.exports = ProjectDetail;
