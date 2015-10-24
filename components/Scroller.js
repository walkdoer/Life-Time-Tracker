var React = require('react');
var IScroll = require('../libs/iscroll');


var Scroller = React.createClass({

    render: function () {
        var styleObj = this._getStyleObj();
        return <div className={"ltt_c-IScroll " + (this.props.className || '')} style={styleObj}>
            <div className="ltt_c-IScroll-scroller">
                {this.props.children}
            </div>
        </div>
    },

    _getStyleObj: function () {
        var styleObj = {};
        if (this.props.height) {
            styleObj.height = this.props.height;
        }
        return styleObj;
    },


    refresh: function () {
        if (this.__scroller) {
            this.__scroller.refresh();
        }
    },

    componentDidUpdate: function () {
        if (this.__scroller) {
            this.__scroller.refresh();
        }
    },

    componentDidMount: function () {
        this.__scroller = new IScroll(this.getDOMNode(), {
            mouseWheel: true,
            scrollbars: true,
            interactiveScrollbars: true,
            shrinkScrollbars: 'scale',
            fadeScrollbars: true
        });

        if (this.props.onSrcollEnd) {
            this.__scroller.on('scrollEnd', this.props.onSrcollEnd);
        }
    }
});

module.exports = Scroller;