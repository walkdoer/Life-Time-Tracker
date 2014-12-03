'use strict';
var sys = require('sys');
var exec = require('child_process').exec;
var Msg = require('./message');

exports.exec = function (command) {
    exec(command, function(error, stdout, stderr) {
        sys.print(stdout);
        sys.print(stderr);
        if (error !== null) {
            Msg.error('exec error: ' + error);
        }
    });
};
