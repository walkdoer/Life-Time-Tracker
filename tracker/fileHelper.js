/**
 * file helper
 */
'use strict';

var fs = require('fs');
var path = require('path');
var msg = require('./message');
var mkdirp = require('mkdirp');
exports.json = function (fileName, data) {
    var saveStr;
    if (typeof data === 'object') {
        saveStr = JSON.stringify(data, null, 4);
    }
    var pathName = path.dirname(fileName);
    mkdirp(pathName, function (err) {
        if (err) {
            throw err;
        }
        fs.writeFile(fileName, saveStr, function (err) {
            if (err) {
                throw err;
            }
            msg.info('File ' + fileName + ' saved');
        });
    });
};
