//加载express模块
const express = require("express");
//加载模板
const swig = require("swig");

//引入mongose模块
const mongoose = require("mongoose");

//处理数据
const bodyParser = require("body-parser");

//创建app应用 = http.createserver()
var app = express();


//引用cookie模块
const Cookies = require("cookies");
const User = require("./models/User")
//中间件 定义当前应用所使用的模板引擎，使用swig下面的renderFile/ejs.render();
//第一个参数  模板引擎的名字，也.
// 是模板文件的后缀
app.engine("html",swig.renderFile);  //凡是遇到html格式 自动调用这个方法

//配好了引擎还要设置一下c存放目录,第一个参数必须是views  第二个参数是目录  刚刚html创建在views下
app.set("views","./views");


//设置完要连接起来  engine和set连起来  引擎中间件和目录连起来生成另一个中间件
//第一个不能改 要配置视图引擎 这是官方名字 第二个参数 是我们上面配置的app.engine的模板名字 视图引擎要加载视图路径 用什么加载要告诉他
app.set("view engine","html");

//第三方模块在使用之前一定要先设置中间件
app.use(bodyParser.urlencoded({extended: true}));

//这里是在每一个页面上面都挂了一个cookie的使用方法，就不用再每个页面都弄上了，而每一个路由都要去判断是否登陆过了 每一个路由都判断很麻烦，索性就直接取出来
app.use(function(req,res,next){
    req.cookies = new Cookies(req,res);
    //用一个cookie的键
    //每一个路由都要去检测是否登陆 这里面登陆和不登陆不一样  把数据挂在req上
    //当前用户是不是管理员要挂在req.userInfo上
    req.userInfo = {};
    if(req.cookies.get("userInfo")){
        //如果取到了数据，说明在cookie里面存了
        try{
            req.userInfo = JSON.parse(req.cookies.get("userInfo"));//cookie取出来的是一个字符串  通过jsonparse转成对象以后挂在这个req身上,这样后面的路由去判断的时候就比较方便了

            //获取当前用户是否是管理员
            User.findById(req.userInfo._id).then(function(userInfo){ //这里注意把userinfo当作参数传进来
                req.userInfo.isAdmin = Boolean(userInfo.isAdmin);
                next();
            })
        }catch(err){
            console.log(err);
        }
    }else{
        next();//if完了之后这个else也需要next  要不然他进不到下一个路由去
    }
    //这后面注意不要再加next了
})

//首页  req request 请求对象   res response 响应对象
// app.get("/",function(req,res,next){
//     // res.send("<h1>欢迎光临我的博客</h1>")//相当于http write
//     res.render("index");
//     // ./views/index/html  但是由于所有的模板都写好了 写好了之后先去监听到加载的是html页面，调用模板的renderFile
// })

//根据不同的路由进行分发 不同的功能有不同的路由 然后把上面的注掉 我们要根据不同的路由进行分发 由main去处理index

app.use("/admin",require('./routers/admin'));
app.use("/api",require('./routers/api'));   //当我找到/的时候 首先来找这边 这边的接收到了/api这个信息 他就请求('./routers/api')这个js文件
app.use("/",require('./routers/main'));


// app.get("/main.css",function(req,res,next){
//     res.setHeader("content-type","text/css");
//     // res.send("body{background:red}"); //这时候是没用的 相当于直接写在body里 这时候以html格式数据解析 我们需要以css解析，所以需要设置解析格式头
//     //所以需要存在public里面
//     //当我们监听到这个路由之后，首先要设置加载头 设置完之后再通过往里读这句话
//     res.render("./public/main.css")
// })//*********************************存疑

//设置静态文件托管 app.use 当我们找到路由以后 执行后续的代码 关键点就在于这句话 监听这个路径 约定好一个共同的路径 只要磁盘路径没问题 那么加载也没有问题
app.use("/public",express.static(__dirname + "/public"))

//清除缓存
swig.setDefaults({cache:false});

//加载数据库
mongoose.connect("mongodb://127.0.0.1:27017",function(err){
    if(err){
        console.log("数据库连接失败" + err);
    }else{
        console.log("数据库连接成功");
        app.listen(8081);
    }
})

//npm install -g supervisor     sujpervisor -harmony index
//监听http请求
// app.listen(8081);