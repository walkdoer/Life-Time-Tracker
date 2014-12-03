/**
 * @jsx React.DOM
 */

var React = require('react');
var nwGui = global.nwGui;
var Ltt = global.Ltt;
var Logo = require('./Logo');

var Header = React.createClass({
    /**
     * @return {object}
    */
    render: function() {
        return (
            <header className="ltt_c-header">
                <Logo title="LTT"/>
                <div className="ltt_c-header-controls">
                    <div className="btn-group">
                        <button
                            className="btn btn-primary ltt_c-header-barBtn js-open-sidebar"
                            onClick={this.handleConfigBtnClick}
                        ><i className="fa fa-bars"></i></button>
                        <button className="btn btn-default" onClick={this.syncNote}>
                            <i className="fa fa-refresh"></i>
                        </button>
                    </div>

                    <div className="btn-group">
                        <button className="btn btn-default ltt_c-header-cfgBtn js-open-config"><i className="fa fa-gear"></i></button>
                        <button className="btn btn-default ltt_c-header-debugBtn js-debugApplication" onClick={this.debugApplication}>
                            <i className="fa fa-gear"></i>
                        </button>
                        <button className="btn btn-default ltt_c-header-closeBtn js-closeWindow" onClick={this.closeWindow}>
                            <i className="fa fa-close"></i>
                        </button>
                    </div>
                </div>
            </header>
        );
    },

    handleConfigBtnClick: function () {
        this.props.onConfigBtnClick();
    },

    closeWindow: function () {
        Ltt.close();
    },

    debugApplication: function () {
        nwGui.Window.get().showDevTools();
    },

    syncNote: function () {
        
    }

});

module.exports = Header;
