/*
 * @jsx React.DOM
*/

var React = require('react');
var $ = require('jquery');window.$ = window.Jquery = window.jQuery = $;
// load everything for jquery ui
require('jquery-ui');
require('mousetrap');
var Router = require('react-router');
var Route = Router.Route;
var Routes = Router.Routes;
var NotFoundRoute = Router.NotFoundRoute;
var DefaultRoute = Router.DefaultRoute;
var Link = Router.Link;
var OverviewReport = require('./reports/Overview');
var App = require('./app');

/** Pages */
var Dashboard = require('./pages/Dashboard'),
    Logs = require('./pages/Logs'),
    Page404 = require('./pages/Page404'),
    ProjectsNew = require('./pages/ProjectsNew'),
    Reports = require('./pages/Reports'),
    logEditor = require('./pages/LogEditor'),
    Affects = require('./pages/Affects'),
    Projects = require('./pages/Projects'),
    Goals = require('./pages/Goals'),
    LogCheck = require('./pages/LogCheck');

/** Components */
var ProjectDetail = require('./components/ProjectDetail'),
    ProjectIndex = require('./components/Project/ProjectIndex'),
    LogList = require('./components/LogList'),
    ProjectTask = require('./components/Project/ProjectTask');

/** Reports */
var OverviewReport = require('./reports/Overview'),
    ClassesReport = require('./reports/ClassesReport'),
    TagsReport = require('./reports/TagsReport'),
    ProjectReport = require('./reports/ProjectReport');

/*
<Route name="allProject" path="/projects" handler={Projects}>
            <DefaultRoute name="projectIndex"  handler={ProjectIndex}/>
        </Route>
<Route name="projectDetailVersion" path="/projects/:projectId/versions/:versionId" handler={ProjectDetail}/>
<Route name="projectDetailTaskWithoutVersion" path="/projects/:projectId/tasks/:taskId" handler={ProjectDetail}/>
<Route name="projectDetailTask" path="/projects/:projectId/versions/:versionId/tasks/:taskId" handler={ProjectDetail}/>
*/
var routes = (
    <Route name="app" path="/" handler={App}>
        <Route name="reports" path="/reports" handler={Reports}>
            <Route name="reportOverview" path="/reports/overview" handler={OverviewReport}/>
            <Route name="tagsReport" path="/reports/tags" handler={TagsReport}/>
            <Route name="classsesReport" path="/reports/classes" handler={ClassesReport}/>
            <Route name="projectReport" path="/reports/projects" handler={ProjectReport}/>
            <DefaultRoute handler={OverviewReport}/>
        </Route>
        <Route name="dashboard" path="/dashboard" handler={Dashboard}/>
        <Route name="logs" path="/logs" handler={Logs}/>
        <Route name="projects" path="/projects" handler={ProjectsNew}>
            <DefaultRoute name="tasksIndex"  handler={ProjectIndex}/>
            <Route name="projectTask" path=":projectId" handler={ProjectTask}>
                <Route name="projectLogs" path="tasks/:taskId" handler={LogList}/>
            </Route>
            <Route name="projectVersionTask" path=":projectId/versions/:versionId" handler={ProjectTask}>
                <Route name="taskLogs" path="tasks/:taskId" handler={LogList}/>
            </Route>
        </Route>

        <Route name="projectManage" path="/projectManage" handler={ProjectsNew} handler={Projects}></Route>
        <Route name="logEditor" path="/logEditor/:date" handler={logEditor}/>
        <Route name="affects" path="/affects" handler={Affects}/>
        <Route name="goals" path="/goals" handler={Goals}/>
        <Route name="logCheck" path="logCheck" handler={LogCheck}/>
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


