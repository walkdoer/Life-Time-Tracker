'use strict';

var express = require('express');
var http = require('http');
var _ = require('lodash');


var app = express();
var execute = require('../execute');
var calandar = require('../calendar');
var extend = require('node.extend');
var Param = require('../param');
var logAttr = require('./components/logAttribute');
var Search = require('../search/search');

app.get('/actions/:actionName', function(req, res) {
    var actionName = req.params.actionName;
    execute.exec('ltt action ' + actionName + ' --cups 1');
    res.send('done');
});

useHandler('calendars', '/:type/:year/:month?/:day?', calandar);
useHandler('sleepPeriods');
useHandler('classes', null, getLogAttr);
useHandler('projects', null, getLogAttr);
useHandler('tags', null, getLogAttr);
useHandler('logs', null, queryLogs);

function getLogAttr(params, type) {
    return logAttr.get(type, params);
}

function queryLogs(params) {
    return Search.query(params);
}

function useHandler(type, url, handler) {
    handler = handler || require('./components/' + type);
    url = url || '/:year/:month?/:day?';
    app.get('/' + type + url, function(req, res) {
        var params = getCommonRequestParams(req.params, req.query);
        var promise;
        if (_.isFunction(handler)) {
            promise = handler(params, type);
        } else {
            promise = handler.generate(params);
        }
        promise.then(function(result) {
            res.send(result);
        }).catch(function(err) {
            console.error(err.stack || err);
            res.status(500).send('Server Error');
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
    preprocessQuery(query, ['projects', 'tags', 'classes', 'versions', 'tasks']);

    return extend({}, {
        type: params.type
    }, Param.getDateParams(dateStr), query);

    function preprocessQuery(query, attrs) {
        if (_.isEmpty(attrs)) {
            attrs = [];
        }
        Object.keys(query).forEach(function (key) {
            if (attrs.indexOf(key) >= 0) {
                var val = query[key],
                    arr = !val ? [] : val.split(',');
                query[key] = arr;
            }
        });
    }
}
