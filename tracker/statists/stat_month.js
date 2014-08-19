'use strict';

var when = require('when');
var statDay = require('./stat_day');
var statSport = require('./stat_sport');
var extend = require('node.extend');
var outputLife = require('../output/life');
var outputSport = require('../output/sport');
var msg = require('../message');


//分析者
var sportAnalyser = require('../analysers/sport'),
    lifeAnalyser = require('../analysers/life');

exports.dispose = function (config) {
    stat(config);
};

function stat(config) {
    var dateArr = config.dateArr,
        year = dateArr[0],
        month = dateArr[1];
    //the day number of one month
    var dayNum = getDayNumInMonth(year, month);
    var day = 1;
    var queue = [];
    while (day <= dayNum) {
        var procedure;
        var cfg = extend({}, config, {
            dateStr: [year, month, day].join('-')
        });
        if (config.logClass === 'SPR') {
            procedure = statSport.dispose(cfg);
        } else {
            procedure = statDay.calculate(cfg);
        }
        queue.push(procedure);
        day++;
    }
    when.settle(queue).then(function (datas) {
        var result;

        datas = datas.filter(function (d, index) {
            var day = index + 1,
                date = [year, month, day].join('-');
            if (d.state === 'rejected') {
                msg.warn(date + ' calculate fail');
                return false;
            } else if (d.state === 'fulfilled'){
                return true;
            }
        }).map(function (d) {
            return d.value;
        });
        if (config.logClass === 'SPR') {
            result = sportAnalyser.dispose(datas, year, month);
            outputSport(result);
        } else {
            result = lifeAnalyser.dispose(datas, year, month);
            outputLife(result);
        }
    });
}

function getDayNumInMonth (year, month) {
    return new Date(year, month, 0).getDate();
}

