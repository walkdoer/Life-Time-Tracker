
'use strict';

var express = require('express');
var http = require('http');


var app = express();
var execute = require('../execute');
var calandar = require('../calendar');
var dateTypeEnum = require('../enum/dateType');
var sleepPeriod = require('./components/sleepPeriod');

app.get('/actions/:actionName', function (req, res) {
    var actionName = req.params.actionName;
    execute.exec('ltt action ' + actionName + ' --cups 1');
    res.send('done');
});

app.get('/calendars/:type/:year/:month?', function (req, res){
    var params = getCommonRequestParams(req.params);
    calandar.generate(params).then(function (result) {
        res.send(result);
    });
});

app.get('/sleepPeriods/:year/:month?', function (req, res) {
    var params = getCommonRequestParams(req.params);
    sleepPeriod.generate(params).then(function (result){
        res.send(result);
    });
});


exports.run = function (options) {
    var port = options.port || 3333;
    http.createServer(app).listen(port, function(){
        console.log("Server listening on port " + port);
    });
};


function getCommonRequestParams(params) {
    var year = params.year,
        month = params.month,
        dateType;
    var dateArr = [year, month].filter(notEmpty).map(function (val) {
        return parseInt(val, 10);
    });
    if (!month) {
        dateType = dateTypeEnum.Year;
    } else {
        dateType = dateTypeEnum.Month;
    }
    function notEmpty(val) { return val !== undefined;}
    return {
        dateType: dateType,
        dateStr: dateArr.join('-'),
        dateArr: dateArr,
        type: params.type
    };
}
