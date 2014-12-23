/**
 * Server
 */
'use strict';

var express = require('express');
var path = require('path');
var http = require('http');
var exphbs = require('express3-handlebars');
var morgan = require('morgan');
var request = require('request');
var appRouter = function (req, res) {
    res.render('app', {title: 'Life-Time-Tracker'});
};

var app = express();
var bodyParser = require('body-parser');
var multer = require('multer');

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(multer()); // for parsing multipart/form-data

app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.engine('handlebars', exphbs({
    defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');
app.use(morgan('combined'));
//static resources
app.use('/', express.static(path.join(__dirname, './')));
app.get('/api/*', redirectGet);
app.post('/api/*', redirectPOST);


function redirectGet(req, res) {
    var data = '',
        path = req.url;
    var apiHost = 'http://localhost:3333/';
    var apiUrl = path.slice(5);
    console.log('[Get Request]' + apiHost + apiUrl);
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
                console.error(data);
                res.status(500).send('Ltt服务器发生错误');
            }
        });
    }).on('error', function(e) {
        console.log('problem with request: ' + e.message);
        res.status(500).send(e);
    });
}

function redirectPOST(req, res) {
    var data = '',
        path = req.url;
    var apiHost = 'http://localhost:3333/';
    var apiUrl = path.slice(5);
    console.log('[Post Request]' + apiHost + apiUrl);
    request.post({
        url: apiHost + apiUrl,
        formData:req.body
    }, function (err, httpResponse, body) {
        if (err) {
            console.error('post failed:', err);
            return res.status(500).send(err);
        }
        if(httpResponse.statusCode == 200) {
            res.send(body);
        }
    }).on('error', function(e) {
        console.log('problem with request: ' + e.message);
        res.status(500).send(e);
    });
}

http.createServer(app).listen(app.get('port'), function() {
    console.log("Express server listening on port " + app.get('port'));
});


