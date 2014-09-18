/**
 * notify center
 */
'use strict';


var Notification = require('node-notifier');
var Message = require('./message');



exports.notify = function (messages) {
    messages.forEach(function (msg){
        var notifier = new Notification();
        notifier.notify({
            title: msg.title || 'Life Time Tracker',
            subtitle: msg.subTitle,
            message: msg.content,
            sound: 'Submarine',
            open: msg.open,
            appIcon: __dirname + '/resources/me.jpg',
            //contentImage: __dirname + '/resources/computer_guy.gif'
        }, function (err, response) {
            if (err) {
                Message.error('Notify Error' + err);
            }
            Message.info('Remind:' + msg.title + ' ' + msg.subTitle + '. content:' + msg.content);
        });
    });
};

