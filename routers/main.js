//主管前端页面

const express = require("express");
const router = express.Router();
//引入数据库模型
var Category = require("../models/Category");
var Content = require("../models/Content");

var data;

router.use(function(req, res, next){
    data = {
        userInfo: req.userInfo,
        categories: []
    }
    Category.find().then(function(categories){
        data.categories = categories;
        next();
    })
})

router.get("/",function(req,res,next){

    // console.log(req.userInfo);
    //express他有两个参数 第一个参数是我们要渲染的页面，第二个数据是对象 是我要带什么数据跟过去，第三个参数是他的option，
    //渲染模板在app那边早就设置好了

    //在渲染index.html 上面挂载的数据
    data.page = Number(req.query.page || 1);
    data.limit = 8;
    data.pages =  0;
    data.count = 0;
    data.currentCategory = req.query.category || "";

    var where = {};

    if(data.currentCategory){
        where.category = data.currentCategory;
    }

    Content.where(where).count().then(function(count){
        data.count = count;
        //计算总页数
        data.pages = Math.ceil(count / data.limit);
        //skip
        var skip = (data.page - 1) * data.limit;

        return Content.where(where).find().sort({_id: -1}).limit(data.limit).skip(skip).populate(["category", "user"]);
    }).then(function(contents){
        data.contents = contents;
        res.render("main/index", data);
    })

})


router.get("/view", function(req, res){
    var contentId = req.query.contentid || "";
    //查询具体的数据，渲染页面
    Content.findOne({
        _id: contentId
    }).populate("user").then(function(content){
        data.content = content;

        //设置阅读量
        content.views++;
        content.save()


        res.render("main/view", data);
    })

})


module.exports = router
//把这个路由挂上 扔出去