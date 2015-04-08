var React = require('react');
var numeral = require('numeral');

var Progress = React.createClass({

    getDefaultProps: function () {
        return {
            showNumber: true
        };
    },

    render: function () {
        var value = numeral(this.props.value).value();
        var max = numeral(this.props.max).value();
        var progress = 0;
        if (max !== 0) {
            progress = value / max * 100;
        }
        if (value > max) {
            progress = 100;
        }
        var colors = ['#86e01e', '#f2d31b', '#f2b01e', '#f27011', '#f63a0f'].reverse();
        var level = Math.ceil(value/ (max / colors.length)) - 1;
        var reverse = this.props.reverse;
        if (reverse) {
            colors = colors.reverse();
        }
        var style = {
            'height': this.props.height
        };
        var barStyle = {
            'background-color': colors[level]
        };
        if (reverse) {
            barStyle.width = (100 - progress) + '%';
            barStyle.float = 'right';
        } else {
            barStyle.width = progress + '%';
            barStyle.float = 'left';
        }
        var number, numberStyle;
        if (this.props.showNumber) {
            numberStyle = {};
            number = <span className="ltt_c-progress-number" style={numberStyle}>{numeral(progress).format('0.0')}</span>;
        }
        return (
            <div className="ltt_c-progress" style={style}>
                <div className="ltt_c-progress-bar" style={barStyle} title={progress}>{number}</div>
            </div>
        );
    }
});

module.exports = Progress;