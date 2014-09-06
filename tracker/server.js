/**
 * Server
 *
 * Public Api:
 *
 *  ###Dashboard: `/dashboard/:year[/:month][/:day]`
 *
 *    **Example**
 *
 *      /dashboard/2014
 *      /dashboard/2014/8
 *      /dashboard/2014/8/12
 *
 *  ###Read logs of a date:  /logs/:year[/:month][/:day]
 *
 *    **Example**
 *
 *      /logs/2014
 *      /logs/2014/8
 *      /logs/2014/8/12
 *
 *  ###Drink Water: drink/water/1  drink one cup of water
 *
 *    **Example**
 *
 *      /drink/water/1
 *
 *  ###Notifier: notify/:code
 *
 *    **Example**
 *
 *      /notify/stat_success
 *      /notify/stat_error
 *      /notify/save_error
 *
 *
 */
'use strict';

var express = require('express');
var app = express();

var morgan = require('morgan');

app.use(morgan('combined'));

app.get('/', function(req, res) {
    res.send('hello world');
});

//static resources
app.use('/resources', express.static(__dirname + '/resources'));



app.param('year', function(req, res, next, year) {
    console.log('CALLED ONLY ONCE ' + year);
    next();
});

app.get('/logs/:year', function(req, res) {
    var year = req.param('year');
    res.send(year);
});

app.get('/stats/:year', function(req, res) {
    console.log('and this matches too');
    res.end();
});

app.listen(3000);
