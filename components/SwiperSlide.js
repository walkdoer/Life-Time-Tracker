var React = require('react');
var PureRenderMixin = require('react/addons').addons.PureRenderMixin;

module.exports =  React.createClass({

    mixins: [PureRenderMixin],

    render: function () {
        return <div className="ltt_c-SwiperSlider swiper-slide">{this.props.children}</div>
    }
});