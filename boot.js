/*
 * @jsx React.DOM
*/

var React = require('react');
var $ = require('jquery');window.$ = window.Jquery = window.jQuery = $;
var moment = require('moment');
window.moment = moment;
// load everything for jquery ui
require('jquery-ui');
require('mousetrap');
require('fullcalendar');
require('./libs/jquery.qtip');
var injectTapEventPlugin = require("react-tap-event-plugin");
injectTapEventPlugin();

var Router = require('react-router');
var Route = Router.Route;
var Routes = Router.Routes;
var NotFoundRoute = Router.NotFoundRoute;
var DefaultRoute = Router.DefaultRoute;
var Link = Router.Link;
var OverviewReport = require('./reports/Overview');
var App = require('./app');
var config = require('./conf/config.js');
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
    LogCheck = require('./pages/LogCheck'),
    Settings = require('./pages/Settings'),
    Calendar = require('./pages/Calendar'),
    Routine = require('./pages/Routine'),
    Lab = require('./pages/Lab');

/** Components */
var ProjectDetail = require('./components/ProjectDetail'),
    ProjectIndex = require('./components/Project/ProjectIndex'),
    LogList = require('./components/LogList'),
    ProjectTask = require('./components/Project/ProjectTask');

/** Reports */
var OverviewReport = require('./reports/Overview'),
    ClassesReport = require('./reports/ClassesReport'),
    TagsReport = require('./reports/TagsReport'),
    TodayReport = require('./reports/todayReport'),
    ProjectReport = require('./reports/ProjectReport'),
    WeeklyReport = require('./reports/WeeklyReport'),
    YearReport = require('./reports/YearReport')
    RelationReport = require('./reports/RelationReport');

/** LAB */
var LabPieReport = require('./reports/lab/pie');
var LabLifeClassReport = require('./reports/lab/LifeClass');
var SunburstReport = require('./reports/lab/SunburstReport');

/** Utils */
var DataAPI = require('./utils/DataAPI');
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
            <Route name="todayReport" path="/reports/today" handler={TodayReport}/>
            <Route name="weeklyReport" path="/reports/weekly" handler={WeeklyReport}/>
            <Route name="projectReport" path="/reports/projects" handler={ProjectReport}/>
            <Route name="yearReport" path="/reports/annual" handler={YearReport}/>
            <Route name="relationship" path="/reports/relationship" handler={RelationReport}/>
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
        <Route name="settings" path="settings" handler={Settings}/>
        <Route name="calendar" path="calendar" handler={Calendar}/>
        <Route name="routine" path="routine" handler={Routine}/>
        <Route name="lab" path="/lab" handler={Lab}>
            <Route name="labpie" path="report/pie" handler={LabPieReport}/>
            <Route name="lablifeClass" path="report/lifeClass" handler={LabLifeClassReport}/>
            <Route name="sunburst" path="report/sunburst" handler={SunburstReport}/>
        </Route>
        <NotFoundRoute handler={Page404}/>
        <DefaultRoute handler={Dashboard}/>
    </Route>
);


//load setting and start application
Settings.load().then(function () {
    //increase app init progress bar to 100 percent
    Ltt.setProgress(90);
    //load logClasses
    return DataAPI.Class.load();
}).then(function (classes) {
    config.classes = classes;
}).then(function () {
    Ltt.setProgress(100);
    Router.run(routes, function(Handler) {
        React.render(<Handler />, window.document.getElementById('app-container'));
    });
})
/*
React.render(
    <App
        initialPage="dashboard"
        openNav={true}
    />,
    document.getElementById('app-container')
);
*/


