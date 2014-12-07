/**
 * notify
 */

require('noty');
var noty = window.noty;
var layout = 'bottomRight';

exports.success = function(message) {
    noty({
        type: "success",
        text: message,
        layout: layout,
        theme: 'relax',
        //dismissQueue: true,
        animation: {
            open: 'animated flipInX',
            close: 'animated flipOutX'
        },
    });
};