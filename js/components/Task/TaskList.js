/**
 * @jsx React.DOM
 */
var React = require('react');
var TaskList = React.createClass({
    render: function () {
        return (
            <ul className="ltt_c-taskList">
                {this.props.children}
            </ul>
        );
    }
});

module.exports = TaskList;