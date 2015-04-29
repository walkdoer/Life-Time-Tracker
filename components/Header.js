/**
 * @jsx React.DOM
 */

var React = require('react');
var nwGui = global.nwGui;
var Ltt = global.Ltt;
var Logo = require('./Logo');
var remoteStorage = require('./storage.remote');
var RB = require('react-bootstrap');
var Button = RB.Button;
var ButtonToolbar = RB.ButtonToolbar;
var ButtonGroup = RB.ButtonGroup;
var Notify = require('./Notify');
var Moment = require('moment');
var NO_SYNC = 1, SYNCING = 2, SYNC_ERROR = 3;
var history = window.history;

var disabledBackButton = true,
    disabledForwardButton = true,
    urls = [location.href];
window.addEventListener('hashchange', function (e) {
    disabledBackButton = false;
    disabledForwardButton = false;
    var newURL = e.newURL;
    var urlIndex;
    var alreadyInUrls = urls.some(function (url, index) {
        if (url === newURL) {
            urlIndex = index;
            return true;
        }
        return false;
    });
    if (urlIndex === urls.length - 1) {
        disabledForwardButton = true;
    }
    if (urlIndex === 0) {
        disabledBackButton = true;
    }
    if (!alreadyInUrls) {
        urls.push(newURL);
        disabledForwardButton = true;
    }
});

var Header = React.createClass({

    getInitialState: function () {
        return {
            syncStatus: NO_SYNC
        };
    },

    /**
     * @return {object}
    */
    render: function() {
        var syncIcon;
        var syncStatus = this.state.syncStatus;
        if (syncStatus === SYNCING) {
            syncIcon = 'fa fa-refresh fa-spin';
        } else if (syncStatus === SYNC_ERROR) {
            syncIcon = 'fa fa-exclamation-circle';
        } else if (syncStatus === NO_SYNC){
            syncIcon = 'fa fa-refresh';
        }

        var screenBtn = null;
        if (this.props.isFullscreen) {
            screenBtn = (<Button className="btn btn-default ltt_c-header-cfgBtn"
                onClick={this.props.onLeaveFullscreen}>
                <i className="fa fa-compress"></i></Button>);
        } else {
            screenBtn = (<Button className="btn btn-default ltt_c-header-cfgBtn"
                onClick={this.props.onEnterFullscreen}>
                <i className="fa fa-expand"></i></Button>);
        }
        var style = {
            "-webkit-app-region": "drag"
        };


        return (
            <header className="ltt_c-header" style={style}>
                <Logo title="LTT"/>
                <div className="ltt_c-header-controls">
                    <div className="btn-group">
                        <button
                            className="btn ltt_c-header-barBtn js-open-sidebar"
                            onClick={this.handleConfigBtnClick}
                        ><i className="fa fa-bars"></i></button>
                        <button className="btn btn-default" onClick={this.syncNote}>
                            <i className={syncIcon} title={this.state.syncStatus === SYNC_ERROR ? 'sync fail, click sync again' : 'sync'}></i>
                        </button>
                    </div>
                        <ButtonToolbar>
                            <ButtonGroup className="history-btn-group">
                                <Button className="ltt_c-header-backBtn" disabled={disabledBackButton} onClick={this.back}>
                                    <i className="fa fa-angle-left"></i>
                                </Button>
                                <Button className="ltt_c-header-forwardBtn" disabled={disabledForwardButton} onClick={this.forward}>
                                    <i className="fa fa-angle-right"></i>
                                </Button>
                            </ButtonGroup>
                            <ButtonGroup>
                                <Button className="ltt_c-header-debugBtn js-debugApplication" onClick={this.debugApplication}>
                                    <i className="fa fa-gear"></i>
                                </Button>
                                {screenBtn}
                                <Button className="ltt_c-header-closeBtn js-closeWindow" onClick={this.closeWindow}>
                                    <i className="fa fa-close"></i>
                                </Button>
                            </ButtonGroup>
                        </ButtonToolbar>
                </div>
            </header>
        );
    },

    back: function () {
        history.back();
    },

    forward: function () {
        history.forward();
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
        var that = this;
        this.setState({
            syncStatus: SYNCING
        });
        Ltt.sdk.syncEvernote().then(function (data) {
            if (data.success) {
                Notify.success('Successfully sync!', {timeout: 5000});
                that.setState({
                    syncStatus: NO_SYNC
                });
            } else {
                Notify.error('failed to sync!');
                that.setState({
                    syncStatus: SYNC_ERROR
                });
            }
        }).catch(function (err) {
            Notify.error('failed to sync!');
            that.setState({
                syncStatus: SYNC_ERROR
            });
        });
    }

});

module.exports = Header;
