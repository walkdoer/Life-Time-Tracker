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
        msg = _.extend({
            title: 'Life Time Tracker',
            sound: 'Glass',
            appIcon: __dirname + '/resources/me.jpg',
        }, {
            title: msg.title,
            subtitle: msg.subTitle,
            message: msg.content || ' ',
            //open: msg.open,
            execute: options.execute
            //contentImage: __dirname + '/resources/computer_guy.gif'
        });
        notifier.notify(msg, function (err, response) {
            if (err) {
                Message.error('Notify Error' + err);
            } else {
                Message.info('Remind:' + msg.title + ' ' + msg.subTitle + '. content:' + msg.content);
            }
        });
    });
};

