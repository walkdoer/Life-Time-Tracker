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
var OverviewReport = require('./reports/Overview');
var Report = require('./reports/report');
var App = require('./app');
var Dashboard = require('./pages/Dashboard'),
    Logs = require('./pages/Logs'),
    Page404 = require('./pages/Page404'),
    Projects = require('./pages/Projects'),
    Reports = require('./pages/Reports');

var routes = (
    <Route name="app" path="/" handler={App}>
        <Route name="reports" path="/reports" handler={Reports}>
            <Route name="report" path="/reports/:reportId" handler={Report}/>
            <DefaultRoute handler={Report}/>
        </Route>
        <Route name="dashboard" path="/dashboard" handler={Dashboard}/>
        <Route name="logs" path="/logs" handler={Logs}/>
        <Route name="projects" path="/projects" handler={Projects}/>
        <NotFoundRoute handler={Page404}/>
        <DefaultRoute handler={Dashboard}/>
    </Route>
);

Router.run(routes, function(Handler) {
    React.render(<Handler />, document.getElementById('app-container'));
});
/*
React.render(
    <App
        initialPage="dashboard"
        openNav={true}
    />,
    document.getElementById('app-container')
);
*/


