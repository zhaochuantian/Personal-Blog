var mongoose = require("mongoose");
var usersSchema = require("../schemas/users");


//完成模型类  我们把这个nodel直接返还出来
module.exports = mongoose.model("User", usersSchema); //在这里选择的是admin这个数据库

/*
    【注】以后我们可以通过这个模型创建对象
    和class创建对象的用法一致。
*/