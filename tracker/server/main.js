'use strict';

var express = require('express');
var http = require('http');


var app = express();
var execute = require('../execute');
var calandar = require('../calendar');
var extend = require('node.extend');
var Param = require('../param');
var sleepPeriod = require('./components/sleepPeriod');
var classes = require('./components/classes');

app.get('/actions/:actionName', function(req, res) {
    var actionName = req.params.actionName;
    execute.exec('ltt action ' + actionName + ' --cups 1');
    res.send('done');
});

app.get('/calendars/:type/:year/:month?', function(req, res) {
    var params = getCommonRequestParams(req.params);
    calandar.generate(params).then(function(result) {
        res.send(result);
    });
});

app.get('/sleepPeriods/:year/:month?', function(req, res) {
    var params = getCommonRequestParams(req.params);
    sleepPeriod.generate(params).then(function(result) {
        res.send(result);
    });
});

app.get('/classes/:year/:month?/:day?', function(req, res) {
    var params = getCommonRequestParams(req.params);
    classes.generate(params).then(function(result) {
        res.send(result);
    });
});


exports.run = function(options) {
    var port = options.port || 3333;
    http.createServer(app).listen(port, function() {
        console.log("Server listening on port " + port);
    });
};


function getCommonRequestParams(params) {
    var dateStr = [
        params.year,
        params.month,
        params.day
    ].filter(function(val) {
        return !!val;
    }).join('-');

    return extend({}, {
        type: params.type
    }, Param.getDateParams(dateStr));

}
