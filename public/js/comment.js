$(function(){
    //找到评论按钮 并且添加点击事件
    $("#messageBtn").click(function(){
    if(!$("#messageContent").val()){
        alert("评论内容不能为空");
        return
    }
        $.ajax({
            type:"post",
            url:"/api/comment/post",
            data:{
                //这个数据需要传两个过去，并且要把文章id传过去
                //但是这个页面上面没有文章的id 这个id没法直接获取到了以后去用， 可以在后面随便写一个标签 然后把id赋值上去
                contentid:$("#contentid").val(),
                content:$("#messageContent").val()
            },
            success:function(resData){
                if(!resData.code){
                    // alert("评论成功");
                    $("#messageContent").val("");
                    //通过传输过来的数据，加载评论
                    reanderComment(resData.data.comments);
                    //这边要加载评论 所以我在下面封装一个方法
                }
            }
        })
    })
    function reanderComment(comments){
        //生成的评论
        var html = "";
        comments.reverse(); //逆序
        for(var i = 0 ; i < comments.length ; i++){
            html += `<div class="messageBox">
                <p class="name clear">
                    <span class="fl">${comments[i].username}</span>
                    <span class="fr">${comments[i].postTime}</span>
                </p>
                <p>${comments[i].content}</p>
            </div>`
        }
        $(".messageList").html(html);
    }
})