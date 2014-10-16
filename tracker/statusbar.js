'use strict';
var $ = require('nodobjc');
var moment = require('moment');
$.import('cocoa');

var pool = $.nsautoreleasepool('alloc')('init'),
    app = $.nsapplication('sharedapplication');

// set up the app delegate
var appdelegate = $.nsobject.extend('appdelegate');
appdelegate.addmethod('applicationdidfinishlaunching:', 'v@:@', function(self, _cmd, notif) {
    updatetime();
    setinterval(function () {
        updatetime();
    }, 1000);
    function updatetime() {
        console.log('1');
        var systemstatusbar = $.nsstatusbar('systemstatusbar');
        var statusmenu = systemstatusbar('statusitemwithlength', $.nsvariablestatusitemlength);
        statusmenu('retain');
        var now = new moment();
        var title = $.nsstring('stringwithutf8string', now.format('hh:mm:ss'));
        statusmenu('settitle', title);
    }
});
appdelegate.register();

var delegate = appdelegate('alloc')('init');
app('setdelegate', delegate);
app('activateignoringotherapps', true);
app('run');
pool('release');


