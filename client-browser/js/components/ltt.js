/**
 * application bootstrap
 * @jsx React.DOM
 */



var React = require('react');

var Header = require('./Ltt.Header');
var Nav = require('./Ltt.Nav');
var $ = require('jquery');
var PageManager = require('./Ltt.PageManager');


var NAV_OPEN = 'ltt__navOpen';
var Ltt = React.createClass({

    getInitialState: function () {
        return {
            page: 'dashboard'
        };
    },

    render: function () {
        return (
            <div className="ltt">
                <Nav
                    onMenuClick={this.renderContent}
                />
                <div className="ltt_c-main">
                    <Header
                        onConfigBtnClick={this.toggleNav}
                    />
                    <PageManager page={this.state.page}/>
                </div>
            </div>
        );
    },
    toggleNav: function (isOpen) {
        var $el = $(this.getDOMNode());
        if (isOpen) {
            $el.addClass(NAV_OPEN);
        } else {
            $el.removeClass(NAV_OPEN);
        }
    },
    renderContent: function(menu) {
        this.setState({
            page: menu.key
        });
    }
});

module.exports = Ltt;