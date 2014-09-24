
'use strict';

var express = require('express');
var http = require('http');


var app = express();
var execute = require('../execute');
var calandar = require('../calendar');
var dateTypeEnum = require('../enum/dateType');

app.get('/actions/:actionName', function (req, res) {
    var actionName = req.params.actionName;
    execute.exec('ltt action ' + actionName + ' --cups 1');
    res.send('done');
});

app.get('/calendars/:type/:year/:month', function (req, res){
    var params = req.params,
        year = params.year,
        month = params.month;
    var dateArr = [year, month].map(function (val) {
        return parseInt(val, 10);
    });
    calandar.generate({
        dateType: dateTypeEnum.Month,
        dateStr: dateArr.join('-'),
        dateArr: dateArr,
        type: params.type
    }).then(function (result) {
        res.send(result);
    });
});


exports.run = function (options) {
    var port = options.port || 3333;
    http.createServer(app).listen(port, function(){
        console.log("Server listening on port " + port);
    });
};

