/**
 * notify
 */

require('noty');
var _ = require('lodash');
var noty = window.noty;
var layout = 'bottomRight';
var animation = {
    open: 'animated flipInX',
    close: 'animated flipOutX'
};


var notify = function (type) {
    return function (message, options) {
        var defaultOptions = {
            type: type,
            text: message,
            theme: 'relax',
            dismissQueue: true,
            layout: layout,
            animation: animation
        };
        options = _.extend(defaultOptions, options);
        noty(options);
    };
};
exports.success = notify('success');
exports.error = notify('error');
exports.warning = notify('warning');