var React = require('react');
var IScroll = require('../libs/iscroll');


var Scroller = React.createClass({

    render: function () {
        return <div className={"ltt_c-IScroll " + (this.props.className || '')}>
            <div className="ltt_c-IScroll-scroller">
                {this.props.children}
            </div>
        </div>
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
    }
});

module.exports = Scroller;