'use strict';

var EVENT = require('./constants/EventConstant');
var Bus = require('./utils/Bus');
var DataAPI = require('./utils/DataAPI');
var Moment = require('moment');
var Util = require('./utils/Util.js');
var _ = require('lodash');
var Q = require('q');


function importByDate (date) {
    return Q.promise(function (resolve, reject) {
        DataAPI.importByDate(date).then(function (result) {
            resolve(result);
        }).catch(function (err) {
            reject(err);
        });
    });
}

exports.init = function () {
    Bus.addListener(EVENT.IMPORT_LOG_BY_DATE, function (dateType) {
        var dateRange = Util.toDate(dateType);
        var start = dateRange.start;
        var diff = dateRange.diff;
        start = new Moment(start);
        _.range(diff).reduce(function (promise, i) {
            var date = new Moment(start).add(i, 'day').format('YYYY-MM-DD');
            return promise.then(function () {
                return importByDate(date);
            }).then(function () {
                Bus.emit(EVENT.UPDATE_PROCESS_INDO, date + ' imported');
            });
        }, Q(1)).then(function () {
            Bus.emit(EVENT.UPDATE_PROCESS_INDO, null);
        });
    });
};