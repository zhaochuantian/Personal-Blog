var mongoose = require("mongoose");
var usersSchema = require("../schemas/contents");


//完成模型类
module.exports = mongoose.model("Content", usersSchema);