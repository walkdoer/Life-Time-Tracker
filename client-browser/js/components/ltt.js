/**
 * application bootstrap
 * @jsx React.DOM
 */



var React = require('react');

var Header = require('./Ltt.Header');
var Nav = require('./Ltt.Nav');
var $ = require('jquery');


var NAV_OPEN = 'ltt__navOpen';
var Ltt = React.createClass({

    render: function () {
        var that = this;
        return (
            <div className="ltt">
                <Nav />
                <div className="ltt_c-main">
                    <Header openNav={function (isOpen) {
                        if (isOpen) {
                            that.openNav();
                        } else {
                            that.closeNav();
                        }
                    }}/>
                </div>
            </div>
        );
    },
    openNav: function () {
        $(this.getDOMNode()).addClass(NAV_OPEN);
    },
    closeNav: function () {
        $(this.getDOMNode()).removeClass(NAV_OPEN);
    }
});

module.exports = Ltt;