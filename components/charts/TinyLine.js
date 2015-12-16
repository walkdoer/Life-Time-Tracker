require('../../libs/jquery.peity.js');
var React = require('react');
var _ = require('lodash');

var TinyLine = React.createClass({

    getDefaultProps: function () {
        return {
            value: 0,
            height: 20,
            width: 60
        };
    },

    getInitialState: function () {
        var value = this.props.value;
        var displayValue = '';
        if (_.isString(value)) {
            displayValue = value
        }
        return {
            displayValue: displayValue
        };
    },

    render: function () {
        return <span className="ltt_c-chart-TinyLine line">{this.state.displayValue}</span>
    },

    componentDidMount: function () {
        var value = this.props.value;
        if (this.state.displayValue) {
            this.plot();
        } else if (_.isFunction(value)){
            value().then(function (data) {
                this.setState({
                    displayValue: data
                }, function (){
                    this.plot();
                });
            }.bind(this))
        }
    },

    plot: function () {
        $(this.getDOMNode()).peity("line", _.omit(this.props, 'value'));
    }
})


module.exports = TinyLine;