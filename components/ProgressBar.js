var React = require('react');
var numeral = require('numeral');

var ProgressBar = React.createClass({
    getDefaultProps: function () {
        return { expect: 0, value: 0, max: 0};
    },

    componentWillMount: function () {
        this._realPg = 0;
        this._expectPg = 0;
    },

    render: function () {
        var expect = numeral(this.props.expect).value();
        var value = numeral(this.props.value).value();
        var max = numeral(this.props.max).value();
        var colors = ['#86e01e', '#f2d31b', '#f2b01e', '#f27011', '#f63a0f'].reverse();
        var level = 0;
        if (max !== 0) {
            this._realPg = value / max * 100;
            this._expectPg = expect / max * 100;
            level = value < max ? (Math.ceil(value/ (max / colors.length)) - 1) : (colors.length - 1);
        }
        if (level < 0) {level = 0;}
        var style = {
            'backgroundColor': colors[level]
        };
        return (
            <div className="ltt_c-ProgressBar" style={style}>
                <div className="bar-percentage" data-realpg={this._realPg} data-expectpg={this._expectPg}></div>
                <div className="bar-container">
                    <div className="bar"></div>
                </div>
            </div>
        );
    },

    componentDidMount: function () {
        this._updateProgress();
    },

    _updateProgress: function () {
        var $el = $(this.getDOMNode());
        var $percentage = $el.find('.bar-percentage');
        var $bar = $el.find('.bar');
        $({
            realPg: 0,
            expectPg: 0
        }).animate({
            realPg: this._realPg,
            expectPg: this._expectPg
        }, {
            duration: 2000,
            easing:'linear',
            step: function() {
                var pct = (++this.realPg).toFixed(0) + '%';
                $percentage.text(pct);
                $bar.css('width', pct);
            }
        })
    },

    componentDidUpdate: function () {
        this._updateProgress();
    }
});

module.exports = ProgressBar;