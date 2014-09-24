/**
 * Server
 *
 * Public Api:
 *
 *  ###Dashboard: `/dashboard/:year[/:month][/:day]`
 *
 *    **Example**
 *
 *      /dashboard/2014
 *      /dashboard/2014/8
 *      /dashboard/2014/8/12
 *
 *  ###Read logs of a date:  /logs/:year[/:month][/:day]
 *
 *    **Example**
 *
 *      /logs/2014
 *      /logs/2014/8
 *      /logs/2014/8/12
 *
 *  ###Drink Water: drink/water/1  drink one cup of water
 *
 *    **Example**
 *
 *      /drink/water/1
 *
 *  ###Notifier: notify/:code
 *
 *    **Example**
 *
 *      /notify/stat_success
 *      /notify/stat_error
 *      /notify/save_error
 *
 *
 */
'use strict';

var express = require('express');
var path = require('path');
var http = require('http');
var exphbs = require('express3-handlebars');
var morgan = require('morgan');

var dashboardRouter = require('./routers/dashboard'),
    logsRouter = require('./routers/logs'),
    statsRouter = require('./routers/stats');

var app = express();
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.engine('handlebars', exphbs({
    defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');
app.use(morgan('combined'));
//static resources
app.use('/resources', express.static(path.join(__dirname, '/resources')));

app.get('/', dashboardRouter);
app.get('/logs/:year', logsRouter);
app.get('/stats/:year', statsRouter);

app.get('/calendars/:type/:year/:month', function(req, res) {
    var data = '';
    http.get('http://localhost:3333' + req.path, function (response) {
        console.log('STATUS: ' + response.statusCode);
        response.on('data', function(chunk) {
            data += chunk;
        });
        response.on('end', function (){
            //the api's response content is json string,so need to parse to object
            res.send(JSON.parse(data));
        });
    }).on('error', function(e) {
        console.log('problem with request: ' + e.message);
        res.status(500).send('Server Error');
    });
});
http.createServer(app).listen(app.get('port'), function() {
    console.log("Express server listening on port " + app.get('port'));
});
