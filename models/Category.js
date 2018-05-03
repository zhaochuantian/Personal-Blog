var mongoose = require("mongoose");
var usersSchema = require("../schemas/categries");


//完成模型类
module.exports = mongoose.model("Category", usersSchema);