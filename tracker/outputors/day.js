/**
 * output the day life stat result
 */

'use strict';

var msg = require('../message'),
    util = require('../util'),
    display = require('../dislpay_data');
var outputHelper = require('./helper');

exports.dispose = function (statResult, options) {
    if (options.perspective) {
        outputHelper.outputPerspectives(statResult, options.perspective.toLowerCase());
    } else {
        outputMain(statResult);
        outputHelper.outputPerspectives(statResult, ['sport', 'sit']);
    }
    return statResult;
};

function outputMain(statResult) {
    var UNRECORDED = '未记录',
        options = statResult.options,
        tags = statResult.tags,
        logs = statResult.logs,
        date = statResult.date,
        activeTime = statResult.activeTime,
        classes = statResult.classes;
    //calculate total time
    var trackedTime = statResult.trackedTime,
        totalHours = trackedTime / 60,
        wakeMoment = statResult.wakeMoment,
        sleepMoment = statResult.sleepMoment;
    //out put the basic info of the log
    msg.info(generateBasicInfo({
        date: date,
        tagNum: tags.length,
        logNum: logs.length
    }));
    msg.log('起床时间: ' + util.formatTime(wakeMoment));
    if (statResult.offDutyMoment) {
        msg.log('下班时间: ' + util.formatTime(statResult.offDutyMoment));
    }
    msg.log('睡觉时间: ' + (util.formatTime(sleepMoment) || UNRECORDED.red));

    var allActiveHours;
    if (activeTime > 0) {
        allActiveHours = activeTime / 60;
        msg.log('Active Time:' + activeTime.toString().cyan + ' mins;' + allActiveHours.toFixed(2).cyan + ' h');
        msg.log('有记录时间: ' + trackedTime.toString().cyan + ' mins; ' + totalHours.toFixed(2).cyan + ' h');
        msg.log('未记录时间: ' + (activeTime - trackedTime + '').cyan + ' mins');
    }


    var sleepTime = statResult.sleepTime;
    if (sleepTime > 0) {
        var hours = sleepTime / 60,
            warnMsg = '';
        if (hours < 7) {
            warnMsg = 'WARN sleepMoment is not enough'.yellow;
        }
        console.log('睡眠长度: ' + hours.toFixed(2).cyan + 'h ' + warnMsg);
    }

    //output the tags which has been sorted by frequence
    msg.log('Tags: '.bold + tags.map(readNameAndFrequence).join(', ').italic.blue);
    //output the classes which has been sorted by frequence
    msg.log('Classes: '.bold + classes.map(readNameAndFrequence).join(', ').magenta);

    /**
     * read the class or tagName and it's frequence
     * @return
     */
    function readNameAndFrequence(obj) {
        return obj.name + '(' + obj.frequence + ')';
    }
    //output every classes time consume
    msg.log('========== Group By Classe =========='.white);
    display.bar(statResult.classTime, {order: 'desc'});

    msg.log('========== Group By Tag =========='.white);
    display.bar(statResult.tagTime, {order: 'desc'});

    msg.log('========== Group By Project =========='.white);
    display.bar(statResult.projectTime, {order: 'desc'});

    if (options.showOriginLogs) {
        console.log('========== Origin Logs ============'.white);
        console.log(statResult.fileContent.magenta);
    }

}


function generateBasicInfo(data) {
    return data.date + ' have ' + data.logNum + ' logs and ' + data.tagNum + ' tags;';
}
