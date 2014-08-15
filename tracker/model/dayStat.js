var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var dayStatSchema = Schema({
    id: String,
    wakeTime: Date,
    sleepTime: Date,
    sleepLength: Number,
    trackedTime: Number,
    activedTime: Number,
    classes: Array,
    tags: Array
});

module.exports = mongoose.model('DayStat', dayStatSchema);
