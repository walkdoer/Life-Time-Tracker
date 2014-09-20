/**
 * Drink action
 */
'use strict';
var util = require('../util');
var drinkWaterConfig = require('../conf/config.json').water.drinkWater;
var Msg = require('../message');
var moment = require('moment');
exports.execute = function (options) {
    var time = moment().format('YYYY-MM-DD HH:mm:ss');
    var line = [time, options.cups].join(',');
    util.appendFile(drinkWaterConfig, line)
        .then(function(line) {
            Msg.info('log drink:' + line);
        });
};
