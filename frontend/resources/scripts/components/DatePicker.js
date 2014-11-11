/**
 * @jsx React.DOM
 */

var React = require('react');

var DatePicker = React.createClass({

    render: function () {
        return (
            <input type="text" ref="date" className="ltt_c-page-logs-date"/>
        );
    }

});

module.exports = DatePicker;
