var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var Tag = Schema({
    name: String
});

module.exports = mongoose.model('Tag', Tag);
