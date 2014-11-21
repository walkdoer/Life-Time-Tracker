/**
 * @jsx React.DOM
 */

var React = require('react');
var nwGui = window.nwGui;

var Header = React.createClass({
    /**
     * @return {object}
    */
    render: function() {
        return (
            <header className="ltt_c-header">
                <button
                    className="btn btn-primary ltt_c-header-barBtn js-open-sidebar"
                    onClick={this.handleConfigBtnClick}
                ><i className="fa fa-bars"></i></button>
            <div className="ltt-btn-grp pull-right">
                <button className="ltt-btn ltt_c-header-cfgBtn js-open-config"><i className="fa fa-gear"></i></button>
                <button className="ltt-btn ltt_c-header-debugBtn js-debugApplication" onClick={this.debugApplication}>
                    <i className="fa fa-gear"></i>
                </button>
                <button className="ltt-btn ltt_c-header-closeBtn js-closeWindow" onClick={this.closeWindow}>
                    <i className="fa fa-close"></i>
                </button>
            </div>
            </header>
        );
    },

    handleConfigBtnClick: function () {
        this.props.onConfigBtnClick();
    },

    closeWindow: function () {
        window.close();
    },

    debugApplication: function () {
        nwGui.Window.get().showDevTools();
    }

});

module.exports = Header;
