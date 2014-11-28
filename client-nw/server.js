/**
 * Server
 */
'use strict';

var express = require('express');
var path = require('path');
var http = require('http');
var exphbs = require('express3-handlebars');
var morgan = require('morgan');

var appRouter = function (req, res) {
    res.render('app', {title: 'Life-Time-Tracker'});
};

var app = express();
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.engine('handlebars', exphbs({
    defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');
app.use(morgan('combined'));
//static resources
app.use('/', express.static(path.join(__dirname, './')));
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
                res.status(500).send('Ltt服务器发生错误');
            }
        });
    }).on('error', function(e) {
        console.log('problem with request: ' + e.message);
        res.status(500).send(e);
    });
}

http.createServer(app).listen(app.get('port'), function() {
    console.log("Express server listening on port " + app.get('port'));
});


