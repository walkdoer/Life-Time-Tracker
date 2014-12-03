/**
 * @jsx React.DOM
 */

var React = require('react');
var nwGui = global.nwGui;
var Ltt = global.Ltt;
var Logo = require('./Logo');
var remoteStorage = require('./storage.remote');
var Moment = require('moment');
var NO_SYNC = 1, SYNCING = 2, SYNC_ERROR = 3;
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
                            <i className={syncIcon} title={this.state.syncStatus === SYNC_ERROR ? 'sync fail, click sync again' : 'sync'}></i>
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
        var that = this;
        this.setState({
            syncStatus: SYNCING
        });
        var mStart = new Moment().startOf('month');
        var mEnd = new Moment().endOf('month');
        remoteStorage.get('/api/syncNote', {
            start: mStart.toDate(),
            end: mEnd.toDate()
        }).then(function (result) {
            var data = result.data;
            if (data.success) {
                that.setState({
                    syncStatus: NO_SYNC
                });
            } else {
                that.setState({
                    syncStatus: SYNC_ERROR
                });
            }
        }).catch(function (err) {
            that.setState({
                syncStatus: SYNC_ERROR
            });
        });
    }

});

module.exports = Header;
