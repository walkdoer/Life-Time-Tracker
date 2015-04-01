/**
 * @jsx React.DOM
 */

var React = require('react');
var $ = require('jquery');
var Moment = require('moment');
var ReactBootStrap = require('react-bootstrap');
var Button = ReactBootStrap.Button;
var ReactPropTypes = React.PropTypes;
var numeral = require('numeral');
var cx = require('react/lib/cx');

/** constant */
var ENTER_KEY_CODE = 13;

/** Components */
var LoadingMask = require('../components/LoadingMask');
var Notify = require('../components/Notify');

/** Actions */

/** utils */
var DataAPI = require('../utils/DataAPI');


module.exports = React.createClass({

    getInitialState: function () {
        return {};
    },


    render: function () {
        return (
            <div className="ltt_c-page-Goals">
                <h3>Goals</h3>
            </div>
        );
    }

});