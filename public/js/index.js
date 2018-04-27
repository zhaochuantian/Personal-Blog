$(function(){
    $loginBox = $("#loginBox");
    $registerBox = $("#registerBox");

    //点击马上注册，切换到注册面板
    $loginBox.find("a").on("click", function(){
        $registerBox.show();
        $loginBox.hide();

    })

    //切换到登录面板
    $registerBox.find("a").on("click", function(){
        $registerBox.hide();
        $loginBox.show();

    })

    /*
        注册
    */
    $registerBox.find("button").on("click", function(){
        //点击注册按钮，通过ajax提交请求
        $.ajax({
            type: "POST",
            url: "/api/user/register",
            data: {
                username: $registerBox.find("[name=username]").val(),
                password: $registerBox.find("[name=password]").val(),
                repassword: $registerBox.find("[name=repassword]").val()
            },
            dataType: "json",
            success: function(res){
                // console.log(res);
                $registerBox.find(".colWarning").html(res.message);//这里注意jquery对象别找错了
                //注册成功，跳转到登录界面
                //一般情况下会有一个滞后   这里要带一个延时器 让注册页面隐藏掉 让登陆页面显示出来
                if(!res.code){//判断rescode为真的时候，因为我们在初始化bodypersor的时候 设置了状态码为0 ，那么当状态码没有被修改的时候 就能说明这个整个注册过程中没有出错
                    setTimeout(function(){
                        $registerBox.hide();
                        $loginBox.show();
                    }, 1000);
                }
            },
            error: function(aaa,bbb,ccc){
                console.log("请求错误:" + ccc);
            }
        })
    })
    /*
        登录
    */
    $loginBox.find("button").on("click", function(){
        //通过ajax提交请求
        $.ajax({
            type: "post",
            url: "api/user/login", //这里用了这个url 那么就去api那边给他加一个login的路由
            data: {
                username: $loginBox.find("[name=username]").val(),
                password: $loginBox.find("[name=password]").val()
            },
            dataType: "json",
            success: function(res){
                // console.log(res);
                //提示信息
                $loginBox.find(".colWarning").html(res.message);
                if(!res.code){
                    //登录成功
                    setTimeout(function(){
                        // $loginBox.hide();
                        // $(".userInfo").show(); //存了cookie以后 就可以直接让他重新刷新，就不需要用js去控制了
                        location.reload();


                        // $(".userInfo").find(".username").html(res.userInfo.username);这里是直接显示的方法 现在不能这样直接去赋值
                    }, 1000);
                }
            },
            error: function(err,aaa,bbb){
                console.log("请求错误:" + bbb);
            }
        })
    })

    //退出
    $("#logoutBtn").on("click", function(){//找到退出按钮 在这里是没有办法去操作cookie的 这个时候需要去给api发个信息 让index告诉api 然后让api把cookie删了
        $.ajax({
            url: "/api/user/logout",
            success: function(res){
                if(!res.code){
                    //重载页面
                    window.location.reload()
                }
            },
            error: function(err){
                console.log("退出失败:" + err);
            }
        })
    })
})
