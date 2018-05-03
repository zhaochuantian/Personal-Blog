//后台管理页面
const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Category = require("../models/Category")
const Content = require("../models/Content")

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
    var limit = 10;
    var skip = (page - 1 ) * limit ;
    var pages = 0 ;
    //这里还要算出总条数
    User.count().then(function(count){
        //计算总页数
        pages = Math.ceil(count / limit);
        User.find().sort({_id:-1}).limit(limit).skip(skip).then(function(users){
            // console.log(users);
            res.render("admin/user_index", {
                userInfo: req.userInfo,
                users: users,
                page: page, //当前页
                pages: pages,
                count: count,
                limit: limit,
                path: "user"
            })
        })
    })
})
//分类首页的路由
router.get("/category", function(req, res){
    var page = Number(req.query.page || 1);
    var limit = 5;
    var skip = (page - 1) * limit;
    var pages = 0;
    /*
        计算总页数
    */
    Category.count().then(function(count){
        //计算总页数
        pages = Math.ceil(count / limit);
        Category.find().sort({_id:-1}).limit(limit).skip(skip).then(function(categries){
            res.render("admin/category_index", {
                userInfo: req.userInfo,
                categries: categries,
                page: page,
                count: count,
                pages: pages,
                limit: limit,
                path: "category"
            })
        })
    })

})

/*
    分类添加
*/
router.get("/category/add", function(req, res){
    res.render("admin/category_add", {
        userInfo: req.userInfo
    })
})
/*
    分类保存  还是提交到原来的页面，但是提交方式不同
    将提交上的数据进行存储，存储数据库中
*/
router.post("/category/add", function(req, res){
    /*
        处理提交过来的数据
        数据进行验证
    */
    var name = req.body.name || "";
    if(name == ""){
        //如果为空，我们去渲染一个通用的错误页面
        res.render("admin/error", {
            userInfo: req.userInfo,
            message: "名称不能为空"
        });
        return;
    }

    /*
        验证数据中是否已经存在相同名称的分类
    */
    Category.findOne({
        name: name
    }).then(function(result){
        if(result){
            //数据库已经存在该分类
            res.render("admin/error", {
                userInfo: req.userInfo,
                message: "分类已经存在"
            });
            return Promise.reject();
        }else{
            //数据没有改分类，可以保存
            return new Category({name: name}).save();
        }
    }).then(function(newCategory){
        res.render("admin/success", {
            userInfo: req.userInfo,
            message: "分类保存成功",
            url: "/admin/category"
        })
    })

})

/*
    分类修改
*/
router.get("/category/edit", function(req, res){
    //获取到要修改的分类的信息，并且用表单形式展现出来
    var id = req.query.id || "";
    //获取修改的分类信息
    Category.findOne({
        _id: id
    }).then(function(category){
        if(!category){
            res.render("admin/error", {
                userInfo: req.userInfo,
                message: "分类信息不存在"
            })
        }else{
            //如果成功找到，直接跳转到编译页面
            res.render("admin/category_edit", {
                userInfo: req.userInfo,
                category: category
            })
        }
    })
})

/*
    分类修改的保存
*/
router.post("/category/edit", function(req, res){
    var id = req.query.id || "";
    var name = req.body.name || "";

    //获取修改的分类信息
    Category.findOne({
        _id: id
    }).then(function(category){
        if(!category){
            res.render("admin/error", {
                userInfo: req.userInfo,
                message: "分类信息不存在"
            });
            return Promise.reject();
        }else{
            //当用户没有做任何修改提交的时候
            if(name == category.name){
                res.render("admin/success", {
                    userInfo: req.userInfo,
                    message: "修改成功",
                    url: "/admin/category"
                })
                return Promise.reject();
            }else{
                return Category.findOne({
                    name: name,
                    _id: {$ne: id}, //id不等于当前的id
                })
            }
        }
    }).then(function(sameCategory){
        if(sameCategory){
            res.render("admin/error", {
                userInfo: req.userInfo,
                message: "数据库中已经存在同名分类"
            });
            return Promise.reject();
        }else{
            return Category.update({
                _id: id
            }, {
                name: name
            });
        }
    }).then(function(){
        res.render("admin/success", {
            userInfo: req.userInfo,
            message: "修改成功",
            url: "/admin/category"
        })
    })
})

/*
    分类删除
*/
router.get("/category/delete", function(req, res){
    // 获取要删除的分类的id
    var id = req.query.id || "";
    Category.remove({
        _id: id
    }).then(function(){
        res.render("admin/success", {
            userInfo: req.userInfo,
            message: "删除成功",
            url: "/admin/category"
        })
    })
})
/*
    内容首页
*/
router.get("/content", function(req, res){
    var page = Number(req.query.page || 1);
    var limit = 10;
    var skip = (page - 1) * limit;
    var pages = 0;
    Content.count().then(function(count){
        //计算总页数
        pages = Math.ceil(count / limit);
        Content.find().sort({_id: -1}).limit(limit).skip(skip).populate(["category", "user"]).then(function(contents){
            console.log(contents);
            res.render("admin/content_index", {
                userInfo: req.userInfo,
                contents: contents,
                page: page,
                count: count,
                pages: pages,
                limit: limit,
                path: "content"
            })
        })
    })

})


/*
    添加内容
*/

router.get("/content/add", function(req, res){
    /*
        获取分类信息
    */
    Category.find().sort({_id: -1}).then(function(categories){
        res.render("admin/content_add", {
            userInfo: req.userInfo,
            categories: categories
        })
    })

})
/*
    保存内容
*/
router.post("/content/add", function(req, res){
    // console.log(req.body);
    // 简单验证
    if(req.body.category == ""){
        res.render("admin/error", {
            userInfo: req.userInfo,
            message: "内容分类不能为空"
        })
        return;
    }
    if(req.body.title == ""){
        res.render("admin/error", {
            userInfo: req.userInfo,
            message: "内容标题不能为空"
        })
        return;
    }


    // 数据验证
    new Content({
        category: req.body.category,
        title: req.body.title,
        description: req.body.description,
        content: req.body.content,
        user: req.userInfo._id.toString()
    }).save().then(function(retult){
        if(retult){
            res.render("admin/success", {
                userInfo: req.userInfo,
                message: "内容保存成功",
                url: "/admin/content"
            })
        }
    })
})
/*
    内容删除
*/
router.get("/content/delete", function(req, res){
    var id = req.query.id || "";
    Content.remove({
        _id: id
    }).then(function(){
        res.render("admin/success", {
            userInfo: req.userInfo,
            message: "内容删除成功",
            url: "/admin/content"
        })
    })
})
/*
    内容修改
*/
router.get("/content/edit", function(req, res){
    var id = req.query.id || "";
    var categories = [];

    //将所有的分类信息读出来
    Category.find().sort({_id: -1}).then(function(result){
        //找到了所有的分类
        categories = result;
        return Content.findOne({
            _id: id
        }).populate("category");
    }).then(function(content){
        if(!content){
            res.render("admin/error", {
                userInfo: req.userInfo,
                message: "指定内容不存在"
            })
        }else{
            res.render("admin/content_edit", {
                userInfo: req.userInfo,
                content: content,
                categories: categories
            })
        }
    })

})

router.post("/content/edit", function(req, res){
    var id = req.query.id || "";
    //做一个简单的验证
    if(req.body.category == ""){
        res.render("admin/error", {
            userInfo: req.userInfo,
            message: "内容分类不能为空"
        })
        return;
    }
    if(req.body.title == ""){
        res.render("admin/error", {
            userInfo: req.userInfo,
            message: "内容标题不能为空"
        })
        return;
    }

    //更新数据库
    Content.update({
        _id: id
    }, {
        category: req.body.category,
        title: req.body.title,
        description: req.body.description,
        content: req.body.content
    }).then(function(result){
        res.render("admin/success", {
            userInfo: req.userInfo,
            message: "内容保存成功",
            url: "/admin/content"
        })
    })
})

module.exports = router;
