/**
 * @jsx React.DOM
 */

var React = require('react');
var cx = React.addons.classSet;

var Tag = React.createClass({

    displayName: 'tag',

    propTypes: {
        onClick: React.PropTypes.func,
        select: React.PropTypes.bool
    },

    getInitialState: function () {
        return {
            select: this.props.select
        };
    },

    getDefaultProps: function () {
        return {
            select: false,
            selectable: false
        };
    },

    render: function () {
        return (
            <span className={cx({"ltt_c-tag": true, "select": this.state.select, "selectable": this.props.selectable})}
                onClick={this.onClick}>
                <i className="fa fa-tag"></i>
                {this.props.children}
            </span>
        );
    },

    onClick: function () {
        this.setState({
            select: !this.state.select
        }, function () {
            this.props.onClick(this.props.value, this.state.select);
        });
    }
});

module.exports = Tag;
