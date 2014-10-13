//'use strict';
//var $ = require('NodObjC');
//var Moment = require('moment');
//$.import('Cocoa');

//var pool = $.NSAutoreleasePool('alloc')('init'),
    //app = $.NSApplication('sharedApplication');

//// set up the app delegate
//var AppDelegate = $.NSObject.extend('AppDelegate');
//AppDelegate.addMethod('applicationDidFinishLaunching:', 'v@:@', function(self, _cmd, notif) {
    //updateTime();
    //setInterval(function () {
        //updateTime();
    //}, 1000);
    //function updateTime() {
        //console.log('1');
        //var systemStatusBar = $.NSStatusBar('systemStatusBar');
        //var statusMenu = systemStatusBar('statusItemWithLength', $.NSVariableStatusItemLength);
        //statusMenu('retain');
        //var now = new Moment();
        //var title = $.NSString('stringWithUTF8String', now.format('HH:mm:ss'));
        //statusMenu('setTitle', title);
    //}
//});
//AppDelegate.register();

//var delegate = AppDelegate('alloc')('init');
//app('setDelegate', delegate);
//app('activateIgnoringOtherApps', true);
//app('run');
//pool('release');


// This example adapted from Matt Gallagher's "Minimalist Cocoa Programming"
// blog article:
//    http://cocoawithlove.com/2010/09/minimalist-cocoa-programming.html
var $ = require('NodObjC')
 
$.import('Cocoa')
 
var pool = $.NSAutoreleasePool('alloc')('init')
  , app  = $.NSApplication('sharedApplication')
 
app('setActivationPolicy', $.NSApplicationActivationPolicyRegular)
 
var menuBar = $.NSMenu('alloc')('init')('autorelease')
  , appMenuItem = $.NSMenuItem('alloc')('init')('autorelease')
 
menuBar('addItem', appMenuItem)
app('setMainMenu', menuBar)
 
var appMenu = $.NSMenu('alloc')('init')('autorelease')
  , appName = $._('Hello NodeJS!')
  , quitTitle = $._('Quit ')('stringByAppendingString', appName)
  , quitMenuItem = $.NSMenuItem('alloc')('initWithTitle', quitTitle
                                        ,'action', 'terminate:'
                                        ,'keyEquivalent', $._('q'))('autorelease')
appMenu('addItem', quitMenuItem)
appMenuItem('setSubmenu', appMenu)
 
var styleMask = $.NSTitledWindowMask
              | $.NSResizableWindowMask
              | $.NSClosableWindowMask
var window = $.NSWindow('alloc')('initWithContentRect', $.NSMakeRect(0,0,200,200)
                                ,'styleMask', styleMask
                                ,'backing', $.NSBackingStoreBuffered
                                ,'defer', false)('autorelease')
window('cascadeTopLeftFromPoint', $.NSMakePoint(20,20))
window('setTitle', appName)
window('makeKeyAndOrderFront', window)
 
// set up the app delegate
var AppDelegate = $.NSObject.extend('AppDelegate')
AppDelegate.addMethod('applicationDidFinishLaunching:', 'v@:@', function (self, _cmd, notif) {
  console.log('got applicationDidFinishLauching')
  console.log(notif)
})
AppDelegate.register()
 
var delegate = AppDelegate('alloc')('init')
app('setDelegate', delegate)
 
app('activateIgnoringOtherApps', true)
app('run')
