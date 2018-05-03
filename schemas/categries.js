var mongoose = require("mongoose");

//定义用户的集合结构，对外的接口
module.exports = new mongoose.Schema({
	//分类名称
	name: String
})