'use strict';
var React = require('react');
var R = React.DOM;
var $ = require('jquery');

var defaultHeight = 40,
    defaultWidth = 80;
var LoadIndicator= React.createClass({
    displayName: 'loadIndicator',
    getInitialState: function () {
        return {
            msg: 'loading'
        };
    },
    componentDidMount: function () {
        var $dom = $(this.getDOMNode());
        var $parent = $dom.parent();
        var domHeight = $dom.height(),
            domWidth = $dom.width();
        var parentHeight = $parent.height(),
            parentWidth = $parent.width();

        var top = (parentHeight - domHeight) / 2,
            left = (parentWidth - domWidth) / 2;
        $parent.css({
            position: 'relative'
        });
        $dom.css({
            top: top,
            left: left,
            position: 'absolute',
            height: this.props.height || defaultHeight,
            width: this.props.width || defaultWidth
        });
    },
    render: function() {
        return R.div({
            className: 'ltt_c-loadIndicator',
            style: {
                textAlign: 'center',
                height: this.props.height || defaultHeight,
                width: this.props.width || defaultWidth
            }
        }, this.state.msg);
    },
    done: function () {
        this.setState({
            msg: ''
        });
        $(this.getDOMNode()).hide();
    }
});



module.exports = LoadIndicator;
