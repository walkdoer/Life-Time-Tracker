
'use strict';

var express = require('express');
var http = require('http');


var app = express();
var execute = require('../execute');

app.get('/actions/:actionName', function (req, res) {
    var actionName = req.params.actionName;
    execute.exec('ltt action ' + actionName + ' --cups 1');
    res.send('done');
});


exports.run = function (options) {
    var port = options.port || 3333;
    http.createServer(app).listen(port, function(){
        console.log("Server listening on port " + port);
    });
};

