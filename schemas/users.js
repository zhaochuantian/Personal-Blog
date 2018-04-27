var mongoose = require("mongoose");

//定义用户的集合结构 对外接口  这个就是声明了一个集合
module.exports =  new mongoose.Schema({
    username:String,
    password:String,
    isAdmin:{
        type:Boolean,
        default:false
    }
})