//后台管理页面

const express = require("express");
const router = express.Router();
const User = require("../models/User.js")

router.get("/",function(req,res,next){
    if(req.userInfo.isAdmin){
        next();
    }else{
        res.send("对不起，只有管理员才能进入后台");
        return;
    }
})

router.get("/",function(req,res,next){
    res.render("admin/index",{
        userInfo: req.userInfo
    })
})

//用户管理界面 这里也需要去渲染一张页面
router.get("/user",function(req,res){
//这里显示的是用户信息，所以我需要去数据库里面请求用户信息的数据
//第一步先要引入models  如果想要实现分页 那么在取数据的时候就应该按照分页去取  limit(number)可以通过skip（number）当页数
    var page = Number(req.query.page || 1) //这个page是为了知道第几页
    var limit = 2;
    var skip = (page - 1 ) * limit ;
    User.find().limit(limit).skip(skip).then(function(users){
        res.render("admin/user_index",{  //这里为什么能找到views
            userInfo: req.userInfo,
            users: users
        })
    })

})


module.exports = router
//把这个路由挂上 扔出去