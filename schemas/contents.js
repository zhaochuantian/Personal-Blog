var mongoose = require("mongoose");

//定义用户的集合结构，对外的接口
module.exports = new mongoose.Schema({
	// 设置关联字段 -- 内容分类的id
	category: {
		//类型
		type: mongoose.Schema.Types.ObjectId,
		//引用，我们分类表中的ID
		ref: "Category"
	},
	title: String,
	description: {
		type: String,
		default: ""
	},
	content: {
		type: String,
		default: ""
	},
	// 关联字段 -- 用户的id
	user: {
		//类型
		type: mongoose.Schema.Types.ObjectId,
		//引用，我们分类表中的ID
		ref: "User"
	},
	addTime: {
		type: Date,
		default: new Date()
	},
	//点击量
	views: {
		type: Number,
		default: 0
	}
})























