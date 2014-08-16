var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var Project = Schema({
    /**
     * 类型
     * Movie, Book, Music, Program
     */
    type: String,

    //分类名称
    name: String
});

module.exports = mongoose.model('Project', Project);
