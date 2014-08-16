var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var Log = Schema({
    /**
     * 日志类型
     * Normal, Fitness, Book
     */
    type: String,
    //日期
    date: Date,
    //开始时间
    start: Date,
    //结束时间
    end: Date,
    //备注
    note: String,
    //时间类别
    classes: Array,
    //标签
    tags: Array,
    //项目 /book movie music program
    projects: Array,
    //原始日志
    origin: String
});

module.exports = mongoose.model('Log', Log);
