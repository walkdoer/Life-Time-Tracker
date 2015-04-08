/**
 * @jsx React.DOM
 */

var React = require('react');
var $ = require('jquery');
var Moment = require('moment');
var _ = require('lodash');
var ReactBootStrap = require('react-bootstrap');
var Input = ReactBootStrap.Input;


module.exports = React.createClass({

    getInitialState: function () {
        return {
            timeStr: buildTime(this.props.value)
        };
    },

    getDefaultProps: function () {
        return {
            onChange: function () {}
        }
    },

    render: function () {
        var task = this.props.task;

        return (
            <Input {... _.omit(this.props, ['onChange', 'onBlur', 'onKeyDown'])} type="text"
                onKeyDown={this.onKeyDown}
                onBlur={this.onBlur}
                onChange={this.onChange}
                value={this.state.timeStr}/>
        );
    },

    onKeyDown: function (e) {
        var ENTER = 13;
        if( e.keyCode == ENTER ) {
            var value = e.target.value.trim();
            var time = this.inspectTime(value);
            if (time >= 0) {
                this.setState({
                    timeStr: buildTime(time)
                });
                this.props.onChange(time);
            }
        }
    },

    onChange: function (e) {
        this.setState({
            timeStr: e.target.value
        });
    },

    onBlur: function (e) {
        var value = e.target.value.trim();
        var time = this.inspectTime(value);
        if (time >= 0) {
            this.props.onChange(time);
        }
    },


    inspectTime: function (time) {
        if (!time) {
            return;
        }
        var unit = getDateUnit(time);
        var result;
        if (unit) {
            var value = parseFloat(time);
            if (unit === 'minute') {
                result = value;
            } else if(unit === 'hour') {
                result = value * 60;
            }  else if(unit === 'month') {
                result = value * 30 * 24 * 60;
            } else if (unit === 'year') {
                result = value * 356 * 24 * 60;
            } else if (unit === 'day') {
                result = value * 24 * 60;
            }
            return result;
        }
    }
});

function buildTime(time) {
    if (!time) {
        return;
    }
    var month, day, hour;
    var hour = time / 60;
    if (hour < 1) {
        return number(time) + ' minutes';
    } else if (hour < 24) {
        return number(hour) + ' hours';
    } else if (hour >= 24) {
        day = hour / 24;
        if (day > 1 && day < 30) {
            return number(day) + ' days';
        } else if (day >= 30){
            month = day / 30;
            if (month > 1 && month < 12) {
                return number(month) + ' months';
            } else if (month >= 12) {
                year = day / 356;
                return number(year) + ' years';
            }
        }
    }
}

function isInt(n){
    return Number(n)===n && n%1===0;
}

function number(val) {
    if(!isInt(val)) {
        return val.toFixed(1);
    }
    return val;
}

function getDateUnit(time) {
    if (!time) {
        return;
    }
    var dateWords = ['year', 'month', 'day', 'week', 'hour', 'minute'];
    var arr = time.split(/\s+/);
    var unitStr = arr[1];
    var unit;
    if (!unitStr) {
        return 'minute';
    }
    if (unitStr === 'm') {
        return 'minute';
    } else if (unitStr === 'M') {
        return 'month';
    } else if (unitStr.toLowerCase() === 'min') {
        return 'minute';
    } else if (unitStr.toLowerCase() === 'mon') {
        return 'month';
    }
    dateWords.some(function (word) {
        var firstLetter = word[0];
        if (word === unitStr ||
            firstLetter === unitStr ||
            firstLetter.toUpperCase() === unitStr ||
            (word + 's') === unitStr ||
            word === unitStr.toLowerCase()
        ) {
            unit = word;
        }
    })
    return unit;
}
