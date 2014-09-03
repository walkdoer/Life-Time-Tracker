'use strict';

var Table = require('cli-table');
var MAX_BAR_LEN = 100;



function displayBar(data, config) {
    config = config || {};
    var color = config.color;
    var total = 0, dataNew = [];
    var order = config.order;
    if (order === 'desc') {
        data = data.sort(function (a, b) {
            return b.count - a.count;
        });
    } else if (order === 'asc') {
        data = data.sort(function (a, b) {
            return a.count - b.count;
        });
    }
    if (Object.prototype.toString.call(data) === '[object Object]') {
        var keys = Object.keys(data);
        keys.forEach(function (key) {
            dataNew.push({
                label: key,
                count: data[key]
            });
        });
        data = dataNew;
    }
    data.forEach(function (l) {
        total += l.count;
    });
    var maxStringLen = getMaxStringLen(data, function (d) {
        return getStrLen(d.label);
    });
    data.forEach(function (l) {
        var percent = l.count / total;
        var hours = (l.count / 60).toFixed(2);
        var output = formatLabel(l.label, maxStringLen).bold + '  ' + bar(percent)[color || 'blue'] + ' ' + (hours+'h').cyan;
        console.log(output);
    });
}

function getBar(data, config) {
    config = config || {};
    var color = config.color;
    var total = 0, dataNew = [];
    if (Object.prototype.toString.call(data) === '[object Object]') {
        var keys = Object.keys(data);
        keys.forEach(function (key) {
            dataNew.push({
                label: key,
                count: data[key]
            });
        });
        data = dataNew;
    }
    data.forEach(function (l) {
        total += l.count;
    });
    var maxBarLen = config.maxLen;
    data.forEach(function (l) {
        l.percent = l.count / total;
        l.bar = bar(l.percent, maxBarLen)[color || 'blue'];
    });
    return data;
}


function bar(percent, maxBarLen) {
    maxBarLen = maxBarLen || MAX_BAR_LEN;
    var barLen = parseInt(percent * maxBarLen, 10);
    var barStr = '';
    while(barLen > 0) {
        barStr += '▋';
        barLen--;
    }
    return barStr;
}

function getMaxStringLen(data, getTarget) {
    var maxStringLen = 0;
    //the default getTarget function is prepare for data like ['string1', 'string2']
    getTarget = getTarget || function (d) { return d.length; };
    data.forEach(function (d) {
        var len = getTarget(d);
        maxStringLen = len > maxStringLen ? len : maxStringLen;
    });
    return maxStringLen;
}

function formatLabel(l, maxStringLen) {
    var len = getStrLen(l);
    var gap = maxStringLen - len;
    l = space(gap) + l + '';
    return l;
}

function getStrLen(str) {
    return str.match(/[^ -~]/g) === null ?
        str.length :
        str.length + str.match(/[^ -~]/g).length;
}

function space(l) {
    var str = '';
    while(l > 0) {
        str += ' ';
        l--;
    }
    return str;
}


function displayTable(config) {
    var table = new Table({
        head: config.head,
        colWidth: config.colWidth
    });

    config.data.forEach(function (row) {
        table.push(row);
    });

    console.log(table.toString());
}

exports.bar = displayBar;
exports.table = displayTable;
exports.getBar = getBar;
