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
var $ = require('jquery');window.$ = window.Jquery = $;
var Router = require('react-router');
var Route = Router.Route;
var Routes = Router.Routes;
var NotFoundRoute = Router.NotFoundRoute;
var DefaultRoute = Router.DefaultRoute;
var Link = Router.Link;


var App = require('./app');
var Dashboard = require('./pages/Dashboard'),
    Logs = require('./pages/Logs'),
    Page404 = require('./pages/Page404'),
    Reports = require('./pages/Reports');

var routes = (
    <Routes location="history">
        <Route name="app" path="/" handler={App}>
            <Route name="reports" handler={Reports}/>
            <Route name="dashboard" handler={Dashboard}/>
            <Route name="logs" handler={Logs}/>
            <NotFoundRoute handler={Page404}/>
            <DefaultRoute handler={Dashboard}/>
        </Route>
    </Routes>
);

React.renderComponent(routes, document.getElementById('app-container'));
/*
React.render(
    <App
        initialPage="dashboard"
        openNav={true}
    />,
    document.getElementById('app-container')
);
*/