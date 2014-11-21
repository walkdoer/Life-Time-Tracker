/**
 * application bootstrap
 * @jsx React.DOM
 */



var React = require('react');
var $ = require('jquery');window.$ = window.Jquery = $;
var addons = require('react/addons').addons;
var cx = addons.classSet;
var ActiveState = require('react-router').ActiveState;
var CurrentPath = require('react-router').CurrentPath;


/** Components */
var Header = require('./components/Header');
var Nav = require('./components/Nav');
var Sidebar = require('./components/Sidebar');
var SearchBox = require('./components/SearchBox');

/* Const */
var NAV_OPEN = 'ltt__navOpen';
var SIDEBAR_OPEN = 'ltt__sidebarOpen';

var App = React.createClass({

    mixins: [ ActiveState, CurrentPath],

    getInitialState: function () {
        return {
            openNav: true
        };
    },


    render: function () {
        var clsObj = {ltt: true};
        clsObj[NAV_OPEN] = this.state.openNav;
        clsObj[SIDEBAR_OPEN] = this._needOpenSidebar();
        var className = cx(clsObj);
        path = this.getCurrentPath();
        return (
            <div className={className}>
                <Nav initialMenuItem={this.getCurrentPage()}/>
                <Sidebar>
                    <SearchBox placeholder="search here"/>
                </Sidebar>
                <div className="ltt_c-main">
                    <Header onConfigBtnClick={this.toggleNav} />
                    <section className="ltt_c-pageManager">
                        <this.props.activeRouteHandler/>
                    </section>
                </div>
            </div>
        );
    },

    _needOpenSidebar: function () {
        if (this.getCurrentPage() === 'reports') {
            return true;
        }
        return false;
    },

    getCurrentPage: function () {
        var path = this.getCurrentPath();
        return path.split('/')[1];
    },

    toggleNav: function () {
        this.setState({
            openNav: !this.state.openNav
        });
    }

});

module.exports = App;