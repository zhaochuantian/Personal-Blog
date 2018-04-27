//主管前端页面

const express = require("express");
const router = express.Router();

router.get("/",function(req,res,next){

    // console.log(req.userInfo);
    //express他有两个参数 第一个参数是我们要渲染的页面，第二个数据是对象 是我要带什么数据跟过去，第三个参数是他的option，
    //渲染模板在app那边早就设置好了
    res.render("main/index.html",{
        userInfo:req.userInfo
    });
})

module.exports = router
//把这个路由挂上 扔出去