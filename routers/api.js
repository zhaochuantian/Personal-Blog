//ajax会把数据带到这里来


const express = require("express");
const router = express.Router();
//引入数据库模型
const User = require("../models/User");


/*
    定义一个统一数据返回格式
*/
var responseData;

router.use(function(req, res, next){
    responseData = {//在这里把reponseDate初始化一下 这个时候next就有用了 执行完上面这一部分以后就可以next
        code: 0,     //错误码
        message: ""  //信息
    }
    next();
})

/*
    bodyParser

    用户注册
    我要获取到提交过来的post数据
    引入bodyParser模块以后，
    我们req上，会自动增加一个属性，这个属性叫做body
    这个属性就是我们post提交的数据
*/
router.post("/user/register", function(req, res, next){
    // console.log("注册");
    /*
        处理post提交过来的数据
    */
    console.log(req.body);

    /*
        下面编写注册逻辑

        1、基本的注册逻辑判断
            (1)用户名不能为空
            (2)密码不能为空
            (3)两次输入的密码必须一致

        2、和数据库中的数据进行比对，判断是否被注册了
            (1)数据库的查询

    */
    var username = req.body.username;
    var password = req.body.password;
    var repassword = req.body.repassword;

    //用户名是否为空
    if(username == ""){
        responseData.code = 1;
        responseData.message = "用户名不能为空";
        res.json(responseData); //意思是将数据转换成json字符串 提交到前端   这个时候如果把数据拿到手了 但是不显示信息的话 说明判断条件应该是== 却写成了=
        return;
    }

    //密码不能为空
    if(password == ""){
        responseData.code = 2;
        responseData.message = "密码不能为空";
        res.json(responseData);
        return;
    }

    //两次输入的密码不一致
    if(password != repassword){
        responseData.code = 3;
        responseData.message = "两次输入的密码不一致";
        res.json(responseData);
        return;
    } //这里都ruturn了 如果它这三次ruturn都没走的话，就能进数据库了

    /*
        用户名是否已经被注册了
        异步串行
        如何判断呢 跟数据库里里面的数据进行比对 怎么看有没有呢 直接拿这个用户名去数据库里取数据，
        我们之前已经在api里面已经引进去了 最后在model里面创建了一个模型 首先引用数据库模型
    */
    //这时候这个user进行的操作 就是我对数据库进行的操作
    User.findOne({//因为用户名只允许有一个 所以只查一个就可以了 然后去查 查完了以后 这个地方主义 所有的操作都是异步的，我们去判断这个结果的时候 要进行一个串行异步操作 必须先等前面查完后面才能去进行操作  mongo自带异步串行 也就是说mongoose的每一个函数都是一个ipromise
        username: username
    }).then(function(userInfo){//then就完事了  这个userinfo参数就是我们拿到的数据
        // console.log(userInfo);
        if(userInfo){
            //表示数据库有该记录
            responseData.code = 4;//这里继续赋值  只要赋值 让他不等于0的话 就说明这信息可以往里面去存
            responseData.message = "用户名已经被注册了";
            res.json(responseData);
            return;
        }

        //保存userInfo  不存在的话我们就要去保存 首先要通过new去创建出来
        var user = new User({
            username: username,
            password: password
        });


        //保存到数据库中
        return user.save(); //创建的这个类 调用save方法去保存直接通过该实例。save方法去保存进数据库当中
        //mongoose这个模块的作用是将我nodejs代码去操作数据库，将整套东西变成一个极其简单的类的操作方式
        //在这里 因为我必须是用一个promise后面才能去跟.then 而因为mongoose模块下面的东西都是promise  所以在这里就把这个mongoose操作去return出来 就变成了一个promise  就可以去加then了
    }).then(function(newUserInfo){
        // console.log(newUserInfo); //这里输出一下信息
        responseData.message = "注册成功";
        res.json(responseData);
        return;
    })
})

/*
    新增登录的路由
*/
router.post("/user/login", function(req, res, next){
    var username = req.body.username;  //这里就和php里面的$声明一样了
    var password = req.body.password;

    if(username == "" || password == ""){
        responseData.code = 1;
        responseData.message = "用户名和密码不能为空";
        res.json(responseData);
        return;
    }
    /*
        数据库验证
    */
    User.findOne({
        username: username,
        password: password
    }).then(function(userInfo){
        if(!userInfo){
            responseData.code = 2;
            responseData.message = "用户名或密码错误";
            res.json(responseData);
            return;
        }else if(userInfo){ //用户名和密码都正确
        //将登录信息返回前端页面

            responseData.message = "登录成功";
            responseData.userInfo = {
                _id: userInfo._id,
                username: userInfo.username
            };


            //这时候说明登陆成功了 然后将cookies存储
            req.cookies.set("userInfo", JSON.stringify({
                _id: userInfo._id,
                username: userInfo.username
            }))
            res.json(responseData);
            return; //这里面的return需要写在这里面 即时返回
        }





    })
})

/*
    退出
*/
router.get("/user/logout", function(req, res){
    //将cookie删除
    req.cookies.set("userInfo", null);
    res.json(responseData); //删了以后还得去返回状态码 告诉前面是否删除成功
})

module.exports = router;
