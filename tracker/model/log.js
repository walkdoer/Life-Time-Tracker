var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

var Log = Schema({
    //日期
    date: {type: Date},
    //开始时间
    start: {type: Date},
    //结束时间
    end: {type: Date},
    //备注
    note: String,
    //时间类别
    classes: Array,
    //标签
    tags: Array,
    //project refer
    project: {type: ObjectId, ref: 'Project'},
    //project refer
    task: {type: ObjectId, ref: 'Task'},
    //原始日志
    origin: String
});

module.exports = mongoose.model('Log', Log);
