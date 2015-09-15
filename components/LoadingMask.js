'use strict';
var React = require('react');
var R = React.DOM;
var $ = require('jquery');

var defaultHeight = 40,
    defaultWidth = 80;
module.exports = React.createClass({

    getInitialState: function () {
        return {
            msg: 'loading'
        };
    },

    componentDidMount: function () {
        this.adjust();
    },

    adjust: function () {
        var $dom = $(this.getDOMNode());
        var $parent = $dom.parent();
        var domHeight = $dom.height(),
            domWidth = $dom.width();
        var parentHeight = parseInt($parent.css('height'), 10),
            parentWidth = parseInt($parent.css('width'), 10);

        var top = (parentHeight - domHeight) / 2,
            left = (parentWidth - domWidth) / 2;
        this.parentPosition = $parent.css('position');
        $parent.css({
            position: 'relative'
        });
        $dom.css({
            height: parentHeight,
            width: parentWidth
        });
    },

    componentWillReceiveProps: function () {
        this.adjust();
    },

    componentWillUnmount: function () {
        var $dom = $(this.getDOMNode());
        var $parent = $dom.parent();
        $parent.css({
            position: this.parentPosition
        });
    },

    render: function() {
        var loaded = this.props.loaded;
        var style = {};
        if (loaded) {
            style.display = 'none';
        } else {
            style.display = 'block';
        }
        if (this.props.opacity !== undefined) {
            style.backgroundColor = 'rgba(254, 254, 254,' +  (1 - this.props.opacity) + ')';
        }
        return (
            <div className='loadingMask' style={style}>
                <div className="vertical-align">
                    <i className="fa fa-spinner fa-spin"></i>
                    {this.state.msg}
                </div>
            </div>);
    },
    done: function () {
        this.setState({
            msg: ''
        });
        $(this.getDOMNode()).hide();
    }
});