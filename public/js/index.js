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
				$registerBox.find(".colWarning").html(res.message);
				//注册成功，跳转到登录界面
				if(!res.code){
					setTimeout(function(){
						$registerBox.hide();
						$loginBox.show();
					}, 1000);
				}
			},
			error: function(err){
				console.log("请求错误:" + err);
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
			url: "api/user/login",
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
						location.reload();
					}, 1000);
				}
			},
			error: function(err){
				console.log("请求错误:" + err);
			}
		})
	})

	//退出
	$("#logoutBtn").on("click", function(){
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




















