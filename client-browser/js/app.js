/*
 * @jsx React.DOM
*/

// var _ = require('lodash');
// var $ = require('jquery');window.jQuery = window.$ = $;
// var Highcharts = require('highcharts');
// var d3 =require('d3');
// var moment = require('moment');
// var nv =require('nvd3');
// var bootstrap = require('bootstrap');
var React = require('react');
console.log('teest');

var Ltt = require('./components/Ltt');
var $ = require('jquery');
window.$ = window.Jquery = $;
require('bootstrap');
React.render(
    <Ltt
        initialPage="dashboard"
        openNav={true}
    />,
    document.getElementById('app-container')
);
