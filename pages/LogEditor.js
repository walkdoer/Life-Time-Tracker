/**
 * @jsx React.DOM
 */

var React = require('react');
var $ = require('jquery');
require('../libs/bootstrap-datepicker');
var remoteStorage = require('../components/storage.remote');
var Moment = require('moment');
var LogEditor = require('../components/editor/LogEditor');
var Page = React.createClass({

    getInitialState: function () {
        return {};
    },

    render: function () {
        return (
            <div className="ltt_c-page ltt_c-page-logEditor">
                <LogEditor/>
            </div>
        );
    }
});

module.exports = Page;
