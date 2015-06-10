/**
 * @jsx React.DOM
 */
var React = require('react');


var TaskList = React.createClass({
    render: function () {
        var className = ['ltt_c-taskList'].concat([this.props.className]).join(' ');
        return (
            <ul className={className} data-name={this.props.name}>
                {this.props.children}
            </ul>
        );
    }
});

module.exports = TaskList;