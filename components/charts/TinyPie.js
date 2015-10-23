require('../../libs/jquery.peity.js');
var React = require('react');
var _ = require('lodash');

var TinyPie = React.createClass({

    getDefaultProps: function () {
        return {
            value: 0,
            height: 12,
            width: 12
        };
    },

    render: function () {
        return <span className="ltt_c-chart-TinyPie pie">{this.props.value}</span>
    },

    componentDidMount: function () {
        $(this.getDOMNode()).peity("pie", _.omit(this.props, 'value'));
    }
})


module.exports = TinyPie;