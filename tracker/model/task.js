var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var Task = Schema({
    name: String,
    attributes: Object,
    parent: Schema.ObjectId,
    projectId: Schema.ObjectId
});

module.exports = mongoose.model('Task', Task);
