/**
 * @jsx React.DOM
 */

var React = require('react');
var $ = require('jquery');
var addons = require('react/addons').addons;
var MenuItem = React.createClass({

    getInitialState: function () {
        var active = !!this.props.active;
        return {
            active: active
        };
    },


    /**
     * @return {object}
     */
    render: function() {
        console.log(this.props);
        var cx = addons.classSet;
        var className = cx({
            'ltt_c-menu-item': true,
            'active': this.state.active
        });
        return (
            <li className={className} onClick={this.active}>
                <i className={this.props.icon}></i>
                <a>{this.props.text}</a>
            </li>
        );
    },

    active: function (e) {
        this.setState({
            active: true
        });
    }

});

module.exports = MenuItem;