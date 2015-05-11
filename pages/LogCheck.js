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

module.exports = React.createClass({

    getInitialState: function () {
        return {
            scanning: false
        };
    },

    render: function () {
        var scanning = this.state.scanning;
        return (
            <div className="ltt_c-page ltt_c-page-logCheck">
                <ButtonGroup>
                    {!scanning ? <Button bsStyle='primary' onClick={this.beginScan}>Start</Button>
                        :<Button bsStyle='danger' onClick={this.stopScan}><i className="fa fa-spinner fa-spin"></i> Stop</Button>}
                </ButtonGroup>
                <div ref='scanResult' className="scan-result"></div>
            </div>
        );
    },

    beginScan: function () {
        this.setState({
            scanning: true
        });
    },


    stopScan: function () {
        this.setState({
            scanning: false
        });
    }

});
