var mongoose = require("mongoose");
var usersSchema = require("../schemas/users");


//完成模型类
module.exports = mongoose.model("User", usersSchema);

/*
	【注】以后我们可以通过这个模型创建对象
	和class创建对象的用法一致。
*/