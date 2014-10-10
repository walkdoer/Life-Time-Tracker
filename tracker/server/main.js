'use strict';

var express = require('express');
var http = require('http');


var app = express();
var execute = require('../execute');
var calandar = require('../calendar');
var extend = require('node.extend');
var Param = require('../param');

app.get('/actions/:actionName', function(req, res) {
    var actionName = req.params.actionName;
    execute.exec('ltt action ' + actionName + ' --cups 1');
    res.send('done');
});

useHandler('calendars', '/:type/:year/:month?/:day?', calandar);
useHandler('sleepPeriods');
useHandler('classes');
useHandler('projects');
useHandler('tags');


function useHandler(type, url, handler) {
    handler = handler || require('./components/' + type);
    url = url || '/:year/:month?/:day?';
    app.get('/' + type + url, function(req, res) {
        var params = getCommonRequestParams(req.params, req.query);
        handler.generate(params).then(function(result) {
            res.send(result);
        });
    });
}

exports.run = function(options) {
    var port = options.port || 3333;
    http.createServer(app).listen(port, function() {
        console.log("Server listening on port " + port);
    });
};


function getCommonRequestParams(params, query) {
    var dateStr = [
        params.year,
        params.month,
        params.day
    ].filter(function(val) {
        return !!val;
    }).join('-');

    return extend({}, {
        type: params.type
    }, Param.getDateParams(dateStr), query);

}
