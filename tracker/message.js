'use strict';

require('colors');

function createMsg(level, msg) {
    return '[' + level + ']  ' + msg;
}

function error(msg, err) {
    console.log(createMsg('Error', msg).red);
    if (err) {
        console.error(err);
        console.error(err.stack);
    }
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

function debug(msg) {
    console.log(createMsg('Debug', msg).grey);
}

function log(msg) {
    console.log(msg);
}


//fs.readFile(DATA_FILE_PRIFIX + argv[1]);
module.exports = {
    error: error,
    info: info,
    success: success,
    warn: warn,
    log: log,
    debug: debug
};
