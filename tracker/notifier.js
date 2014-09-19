/**
 * notify center
 */
'use strict';


var Notification = require('node-notifier');
var Message = require('./message');
var _ = require('lodash');


exports.notify = function (messages, options) {
    if (!_.isArray(messages)) {
        messages = [messages];
    }
    options = _.extend({}, options);
    messages.forEach(function (msg){
        var notifier = new Notification();
        notifier.notify({
            title: msg.title || 'Life Time Tracker',
            subtitle: msg.subTitle,
            message: msg.content,
            sound: 'Glass',
            //open: msg.open,
            appIcon: __dirname + '/resources/me.jpg',
            execute: options.execute
            //contentImage: __dirname + '/resources/computer_guy.gif'
        }, function (err, response) {
            if (err) {
                Message.error('Notify Error' + err);
            } else {
                Message.info('Remind:' + msg.title + ' ' + msg.subTitle + '. content:' + msg.content);
            }
        });
    });
};

