/**
 * application bootstrap
 * @jsx React.DOM
 */



var React = require('react');
var $ = require('jquery');window.$ = window.Jquery = $;
var addons = require('react/addons').addons;
var cx = addons.classSet;
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
            openNav: true
        };
    },


    render: function () {
        var clsObj = {ltt: true};
        clsObj[NAV_OPEN] = this.state.openNav;
        var className = cx(clsObj);
        return (
            <div className={className}>
                <Header onConfigBtnClick={this.toggleNav} />
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
    }

});

module.exports = App;