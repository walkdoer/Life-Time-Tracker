'use strict';
//dependencies
var fs = require('fs');
var colors = require('colors');

//const
var DATA_FILE_PRIFIX = './logs/';

//get the date that want to stat, it can be year or month or day
var argv = process.argv;
var date = argv[2];

if (!date) {
    return error('should have a date arguments.');
}
date = new Date(date);
if (!isValidDate(date)) {
    return error('the date is not right!');
}

success('compute success');


function createMsg(level, msg) {
    return '[' + level + ']  ' + msg;
}

function error(msg) {
    console.log(createMsg('Error', msg).red);
}

function warn(msg) {
    console.log(createMsg('Warn', msg).yellow);
}

function success(msg) {
    console.log(createMsg('Success', msg).green);
}

function info(msg) {
    console.log(createMsg('Info', msg).white);
}

function isValidDate(date) {
    if (Object.prototype.toString.call(date) === '[object Date]') {
        return !isNaN(date.getTime());
    } else {
        return false;
    }
}

//fs.readFile(DATA_FILE_PRIFIX + argv[1]);
