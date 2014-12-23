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


var notify = function (type, defineOptions) {
    return function (message, options) {
        var defaultOptions = {
            type: type,
            text: message,
            dismissQueue: true,
            theme : 'relax',
            layout: layout,
            animation: animation
        };
        _.extend(defaultOptions, defineOptions);
        options = _.extend(defaultOptions, defineOptions, options);
        noty(options);
    };
};
exports.success = notify('success', {timeout: 3000});
exports.error = notify('error');
exports.warning = notify('warning');