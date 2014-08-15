/**
 * database connection
 */

'use strict';
var mongoose = require('mongoose'),
    msg = require('../message');

//connect to lifeTimeTracker database
mongoose.connect('mongodb://localhost/lifeTimeTracker');
var db = mongoose.connection;

db.on('error', msg.error.bind(msg, 'Database connect error.'));
db.once('open', msg.info.bind(msg, 'Database connected.'));

module.exports = db;
