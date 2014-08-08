'use strict';

var MAX_BAR_LEN = 100;


function displayBar(data, color) {
    var total = 0;
    data.forEach(function (l) {
        total += l.count;
    });

    data.forEach(function (l) {
        var percent = l.count / total;
        var hours = (l.count / 60).toFixed(2);
        var output = formatLabel(l.label).bold + '  ' + bar(percent)[color || 'blue'] + ' ' + (hours+'h').cyan;
        console.log(output);
    });
}


function bar(percent) {
    var barLen = parseInt(percent * MAX_BAR_LEN, 10);
    var barStr = '';
    while(barLen > 0) {
        barStr += '▋';
        barLen--;
    }
    return barStr;
}

function formatLabel(l) {
    var maxLen = 13, gap;
    if (l.length > 10) {
        l = l.substr(0, 10) + '...';
    } else {
        gap = maxLen - l.length;
        l = l + space(gap);
    }
    return l;
}

function space(l) {
    var str = '';
    while(l > 0) {
        str += ' ';
        l--;
    }
    return str;
}

exports.bar = displayBar;
