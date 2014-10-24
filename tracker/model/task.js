var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var Task = Schema({
    name: String,
    attributes: Object
});

module.exports = mongoose.model('Task', Task);
