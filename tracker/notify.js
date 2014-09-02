/**
 * notify center
 */
'use strict';

var growl = require('growl');
growl('You have mail!');
growl('5 new messages', { sticky: true });
growl('5 new emails', { title: 'Email Client', image: 'Safari', sticky: true });


var Notification = require('node-notifier');

var notifier = new Notification();
notifier.notify({
    title: "Life-time-tracker",
    message: '统计已经完成',
    sound: 'Submarine',
    subtitle: '点击可以查看结果',
    open: 'http://localhost:4001',
    appIcon: __dirname + '/resources/me.jpg',
    contentImage: __dirname + '/resources/computer_guy.gif'
}, function (err, response) {
    console.log(response);
});
