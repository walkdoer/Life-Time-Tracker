/**
 * @jsx React.DOM
 */

var React = require('react');

var Header = React.createClass({
    /**
     * @return {object}
    */
    render: function() {
        return (
            <header className="ltt_c-header">
                <button
                    className="btn btn-primary ltt_c-header-barBtn js-open-sidebar"
                    onClick={this.openNav}
                ><i className="fa fa-bars"></i></button>
            <button className="btn btn-primary ltt_c-header-cfgBtn js-open-config"><i className="fa fa-gear"></i></button>
            </header>
        );
    },
    openNav: function () {
        this.open = !this.open;
        this.props.openNav(this.open);
    }

});

module.exports = Header;
