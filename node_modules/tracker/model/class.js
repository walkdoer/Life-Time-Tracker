var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var Class = Schema({
    /**
     * 代号
     * 可以方便记录
     * 例如: NT: 日常事务 Normal Thing的缩写
     */
    code: String,

    //分类名称
    name: String
});

module.exports = mongoose.model('Class', Class);
