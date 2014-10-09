'use strict';
var dateTypeEnum = require('./enum/dateType');
var Msg = require('./message');
exports.dispose = function (options, scanResult) {
    var statist = getStatist(options);

    if (statist) {
        return statist.dispose(options, scanResult);
    } else {
        Msg.error('can find corresponding statist for you');
    }
};

function getStatist(options) {
    var dateItems = options.dateItems;
    var dateItemLen;
    if (!dateItems) {
        dateItemLen = -1;
    } else {
        dateItemLen = dateItems.length;
    }
    if (dateItemLen === 1 ) {
        var dateType = dateItems[0].type;
        if (dateType === dateTypeEnum.Day) {
            return require(getStatModuleName('day'));
        } else if (dateType === dateTypeEnum.Month) {
            return require(getStatModuleName('month'));
        } else if (dateType === dateTypeEnum.Year) {
            return require(getStatModuleName('multipleDays'));
        }
    } else if (dateItemLen > 1){
        return require(getStatModuleName('multipleDays'));
    }

    if (options.dateRange) {
        return require(getStatModuleName('multipleDays'));
    }
}


function getStatModuleName(name) {
    return './statists/' + name;
}
