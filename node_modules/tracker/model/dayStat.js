var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var dayStatSchema = Schema({
    id: String,
    //起床时刻
    wakeMoment: Date,
    //睡觉时刻
    sleepMoment: Date,
    //下班时间
    offDutyMoment: Date,
    //睡觉长度
    sleepTime: Number,
    //有记录的时间
    trackedTime: Number,
    //未记录到的时间
    unTrackedTime: Number,
    //活动时间 = sleepMoment - wakeMoment;
    activeTime: Number,
    //时间类别
    classes: Array,
    //标签
    tags: Array,
    //时间按标签归类
    tagTime: Array,
    //时间按类别分类
    classTime: Array,
    //时间按照项目分类
    projectTime: Array
});

module.exports = mongoose.model('DayStat', dayStatSchema);
