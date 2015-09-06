/**
 * @jsx React.DOM
 */

var React = require('react');
var Moment = require('moment');
var _ = require('lodash');
var setIntervalMinxin = require('../components/mixins/setInterval');

var Logo = React.createClass({

    mixins: [setIntervalMinxin],

    getInitialState: function () {
        return _.extend({}, this.getColorSettings());
    },

    getColorSettings: function () {
        var backgroundColor = this.getColorDependOnTime();
        var fontColor = "#FFF";
        if (['#E9D4B0'].indexOf(backgroundColor) >= 0) {
            fontColor = "#494849";
        }
        return {
            backgroundColor: backgroundColor,
            fontColor: fontColor
        };
    },

    render: function () {
        return (
            <div className="ltt_c-logo" style={{backgroundColor: this.state.backgroundColor, color: this.state.fontColor}}>
                <span className="ltt_c-logo-title">{this.props.title}</span>
            </div>
        );
    },

    componentWillMount: function () {
        var that = this;
        this.setInterval(function () {
            that.setState(that.getColorSettings());
        }, 600000);
    },

    getColorDependOnTime: function () {
        var hour = new Moment().hour();
        if (hour >= 0 && hour < 5){
            return "#000000";
        } else if (hour >= 5 && hour < 6) {
            return "#E9D4B0";
        } else if(hour >= 6 && hour < 7) {
            return "#EEC2A2";
        } else if (hour >= 7 && hour < 9) {
            return "#EFA15B"
        } else if (hour >= 9 && hour < 10) {
            return "#4186a7"
        } else if (hour >= 10 && hour < 12) {
            return "#3978a3"
        } else if (hour >= 12 && hour < 15) {
            return "#5B95BE"
        } else if (hour >= 15 && hour < 17) {
            return "#F3BD80"
        } else if (hour >= 17 && hour < 18) {
            return "#B95E50"
        } else if (hour >= 18 && hour < 20) {
            return "#241B61"
        } else if (hour >= 20 && hour < 22) {
            return "#1D1635";
        } else if (hour >= 22 && hour <= 23) {
            return "#060423";
        }
    }
});

module.exports = Logo;
