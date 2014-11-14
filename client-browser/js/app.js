/**
 * application bootstrap
 * @jsx React.DOM
 */



var React = require('react');
var $ = require('jquery');window.$ = window.Jquery = $;
var Header = require('./components/Header');
var Nav = require('./components/Nav');
var addons = require('react/addons').addons;
var cx = addons.classSet;

var NAV_OPEN = 'ltt__navOpen';
var App = React.createClass({

    getInitialState: function () {
        return {
            page: this.props.initialPage,
            openNav: this.props.openNav
        };
    },

    render: function () {
        var clsObj = {ltt: true};
        clsObj[NAV_OPEN] = this.state.openNav;
        var className = cx(clsObj);
        return (
            <div className={className}>
                <Nav
                    initialMenuItem={this.state.page}
                    onMenuClick={this.renderContent}
                />
                <div className="ltt_c-main">
                    <Header
                        onConfigBtnClick={this.toggleNav}
                    />
                    <this.props.activeRouteHandler/>
                </div>
            </div>
        );
    },
    toggleNav: function () {
        this.setState({
            openNav: !this.state.openNav
        });
    },
    renderContent: function(menu) {
        this.setState({
            page: menu.key
        });
    }
});

module.exports = App;