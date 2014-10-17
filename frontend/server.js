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
var _ = require('lodash');
var Err = require('../tracker/err');

var appRouter = require('./routers/app');

var app = express();
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.engine('handlebars', exphbs({
    defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');
app.use(morgan('combined'));
//static resources
app.get('/logs', appRouter);
app.use('/resources', express.static(path.join(__dirname, '/resources')));
app.get('/api/*', redirect);



function redirect(req, res) {
    var data = '',
        path = req.url;
    var apiHost = 'http://localhost:3333/';
    var apiUrl = path.slice(5);
    console.log('[Request]' + apiHost + apiUrl);
    http.get(apiHost + apiUrl, function (response) {
        console.log('STATUS: ' + response.statusCode);
        response.on('data', function(chunk) {
            data += chunk;
        });
        response.on('end', function (){
            //the api's response content is json string,so need to parse to object
            try {
                res.send(JSON.parse(data));
            } catch (e) {
                res.status(500).send(serverError('代理解析结果错误'));
            }
        });
    }).on('error', function(e) {
        console.log('problem with request: ' + e.message);
        res.status(500).send(serverError(e));
    });
}

http.createServer(app).listen(app.get('port'), function() {
    console.log("Express server listening on port " + app.get('port'));
});


function serverError(e) {
    var prefix = 'Server Error';
    var title;
    if (_.isString(e)) {
        title = e;
    } else {
        title = Err.getErrDesc(e);
    }
    var msg = prefix + ' : ' + title;
    return {
        msg: msg
    };
}
