/**
 * application bootstrap
 * @jsx React.DOM
 */



var React = require('react');
var $ = require('jquery');window.$ = window.Jquery = $;
var addons = require('react/addons').addons;
var cx = addons.classSet;
var Ltt = global.Ltt;
var Router = require('react-router');
var State = Router.State;
var RouteHandler = Router.RouteHandler;


/** Components */
var Header = require('./components/Header');
var Nav = require('./components/Nav');

/* Const */
var NAV_OPEN = 'ltt__navOpen';

var App = React.createClass({


    mixins: [State],
    getInitialState: function () {
        return {
            openNav: true,
            isFullscreen: false
        };
    },


    render: function () {
        var clsObj = {ltt: true};
        clsObj[NAV_OPEN] = this.state.openNav;
        var className = cx(clsObj);
        return (
            <div className={className}>
                <Header
                    isFullscreen={this.state.isFullscreen}
                    onConfigBtnClick={this.toggleNav}
                    onEnterFullscreen={this.enterFullscreen}
                    onLeaveFullscreen={this.leaveFullscreen}/>
                <div className="ltt_c-outerContainer">
                    <Nav initialMenuItem={this.getCurrentPage()} ref="nav"/>
                    <section className="ltt_c-innerContainer">
                        <RouteHandler/>
                    </section>
                </div>
            </div>
        );
    },

    componentDidMount: function () {
        this.$el = $(this.getDOMNode());
    },

    getCurrentPage: function () {
        var path = this.getPath();
        return path.split('/')[1];
    },

    toggleNav: function () {
        this.setState({
            openNav: !this.state.openNav
        });
    },


    leaveFullscreen: function () {
        Ltt.leaveFullscreen();
        this.setState({
            isFullscreen: false
        });
    },

    enterFullscreen: function () {
        Ltt.enterFullscreen();
        this.setState({
            isFullscreen: true
        });
    },

    isFullscreen: function () {
        if (Ltt) {
            return Ltt.isFullscreen();
        } else {
            return null;
        }
    },

});

module.exports = App;