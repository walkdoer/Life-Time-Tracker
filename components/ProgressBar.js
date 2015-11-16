var React = require('react');
var numeral = require('numeral');
var _ = require('lodash');
var chroma = require('chroma-js');

var ProgressBar = React.createClass({
    getDefaultProps: function () {
        return { expect: 0, value: 0, max: 0};
    },

    render: function () {
        var expect = numeral(this.props.expect).value();
        var max = numeral(this.props.max).value();
        var today = numeral(this.props.today).value();
        var colors = ['#86e01e', '#f2d31b', '#f2b01e', '#f27011', '#f63a0f'].reverse();
        var level = 0;
        var value = this.props.value;
        var expectPg = 0, realPg = 0;
        if (!_.isArray(value)) {
            value = [value];
        }
        var total = value.reduce(function (total, v) { return total + numeral(v).value(); }, 0);
        if (max !== 0) {
            expectPg = expect / max * 100;
            realPg = total / max * 100;
            level = total < max ? (Math.ceil(total/ (max / colors.length)) - 1) : (colors.length - 1);
        }
        if (level < 0) {level = 0;}
        var style = {
            'backgroundColor': colors[level]
        };
        var expectPercent = expectPg.toFixed(1) + '%';
        var startColor = chroma(colors[level]).brighten(2).hex();
        var endColor = chroma(colors[level]).darken(2).hex();
        var bgColors = chroma.scale([startColor, endColor]).colors(value.length);
        return (
            <div className="ltt_c-ProgressBar" style={style}>
                <div className="bar-percentage" data-realpg={realPg} data-expectpg={expectPg}>{realPg.toFixed(1) + '%'}</div>
                <div className="bar-container">
                    {value.map(function (val, index) {
                        var v = numeral(val).value();
                        var pg = 0;
                        if (max !== 0) {
                            pg = v / max * 100;
                        }
                        return <div className="bar" style={{width: pg + '%', background: chroma(bgColors[index]).alpha(0.7).css()}}></div>
                    })}
                    <div className="expect" title={expectPercent} style={{left: expectPercent, display: expectPg > 0 ?  'block' : 'none'}}></div>
                </div>
            </div>
        );
    },

    shouldComponentUpdate: function (nextProps) {
        var curProps = this.props;
        return curProps.value !== nextProps.value || curProps.max !== nextProps.max || curProps.expect !== nextProps.expect;
    },

    componentDidMount: function () {
        //this._updateProgress();
    },

    _updateProgress: function () {
        var $el = $(this.getDOMNode());
        var $percentage = $el.find('.bar-percentage');
        var $bar = $el.find('.bar');
        var $expectFlag = $el.find('.expect');
        var pct = (this._realPg).toFixed(1) + '%';
        if (this._expectPg > 0) {
            $expectFlag.show();
            $expectFlag.css('left', this._expectPg + '%');
        } else {
            $expectFlag.hide();
        }
        $percentage.text(pct);
        $bar.css('width', pct);
    }

});

module.exports = ProgressBar;