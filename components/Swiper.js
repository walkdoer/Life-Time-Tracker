var React = require('react');
var Swiper = require('swiper');
var PureRenderMixin = require('react/addons').addons.PureRenderMixin;

module.exports = React.createClass({

    mixins: [PureRenderMixin],

    render: function () {

        return (
            <div className="ltt_c-Swiper swiper-container">
                <div className="ltt_c-Swiper-wrapper swiper-wrapper">
                    {this.props.children}
                </div>
                <div className="ltt_c-Swiper-pagination swiper-pagination"></div>
            </div>
        );
    },

    componentDidMount: function () {
        this.swiper = new Swiper(this.getDOMNode(), {
            pagination: '.ltt_c-Swiper-pagination',
            paginationClickable: true
        });
    }

});