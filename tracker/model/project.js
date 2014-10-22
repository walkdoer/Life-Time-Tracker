var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var Project = Schema({
    /**
     * 类型
     * Movie, Book, Music, Program
    type: String,
     */

    //分类名称
    name: String,

    //版本
    version: String,

    //其他属性
    attributes: Object
});

module.exports = mongoose.model('Project', Project);
