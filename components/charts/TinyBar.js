require('../../libs/jquery.peity.js');
var React = require('react');
var _ = require('lodash');

var TinyBar = React.createClass({

    getDefaultProps: function () {
        return {
            value: 0
        };
    },

    getInitialState: function () {
        var value = this.props.value;
        var displayValue = '';
        if (_.isString(value)) {
            displayValue = value;
        }
        return {
            displayValue: displayValue
        };
    },

    render: function () {
        return <span className="ltt_c-chart-TinyBar bar">{this.state.displayValue}</span>
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
        $(this.getDOMNode()).peity("bar", _.omit(this.props, 'value'));
    }
})


module.exports = TinyBar;