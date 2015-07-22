var React = require('react');
var EasyPieChart = require('easyPieChart');

module.exports = React.createClass({

    propTypes: {
        size: React.PropTypes.number.isRequired
    },

    render: function () {
        var percent = this.props.value / this.props.total * 100;
        return <div className="ltt_c-EasyPieChart"
                style={{height: this.props.size, lineHeight: this.props.size+"px", width: this.props.size}}
                data-percent={percent}>
                    <span className="text">{percent.toFixed(2) + '%'}</span>
                </div>
    },

    componentDidMount: function () {
        this._plot();
    },

    componentDidUpdate: function () {
        this._plot();
    },

    _plot: function () {
        return new EasyPieChart(this.getDOMNode(), {size: this.props.size});
    }
});

