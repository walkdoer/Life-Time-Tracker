/**
 * @jsx React.DOM
 */

var React = require('react');
var _ = require('lodash');
var ReactBootStrap = require('react-bootstrap');
var Q = require('q');
var ButtonGroup = ReactBootStrap.ButtonGroup;
var Button = ReactBootStrap.Button;
var PureRenderMixin = require('react/addons').addons.PureRenderMixin;
var Moment = require('moment');

/** configs */
var birthday = require('../conf/config').birthday;

/** Utils */
var DataAPI = require('../utils/DataAPI');

module.exports = React.createClass({

    getInitialState: function () {
        return {
            scanning: false,
            scanResult: []
        };
    },

    render: function () {
        var scanning = this.state.scanning;
        var items = this.state.scanResult.map(function (item) {
            return (
                <div>
                    {item.date}
                    {item.errors.map(function (item) {
                        return <p className="scan-result-item scan-result-error">{item.message}</p>
                    })}
                    {item.warns.map(function (item) {
                        return <p className="scan-result-item scan-result-warn">{item.message}</p>
                    })}
                </div>
            );
        });
        return (
            <div className="ltt_c-page ltt_c-page-logCheck">
                <ButtonGroup>
                    {!scanning ? <Button bsStyle='primary' onClick={this.beginScan}>Start</Button>
                        :<Button bsStyle='danger' onClick={this.stopScan}><i className="fa fa-spinner fa-spin"></i> Stop</Button>}
                </ButtonGroup>
                <div ref='scanResult' className="scan-result">
                    {items}
                </div>
            </div>
        );
    },

    beginScan: function () {
        var that = this;
        this.setState({
            scanning: true
        }, function () {
            this.check().then(function (result) {
                that.setState({
                    scanning: false,
                    scanResult: result
                });
            }).catch(function (err) {
                that.setState({
                    scanning: false
                });
            });
        });
    },


    stopScan: function () {
        this.setState({
            scanning: false
        });
    },

    check: function () {
        return DataAPI.checkLogContent({
            start: new Moment(birthday).toDate(),
            end: new Moment().toDate()
        });
    }

});
