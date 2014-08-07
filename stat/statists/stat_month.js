'use strict';

var util = require('../util');
var msg = require('../message');
exports.stat = function (dateArr) {
    var fileName = dateArr.join('/') + '.md';

    util.readLogFiles(fileName).then(analyse);
};


function analyse(data) {
    msg.info('the file data is');
    msg.info(data);
}
