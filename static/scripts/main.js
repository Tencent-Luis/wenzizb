var socket = io('http://127.0.0.1:8000');
//接收消息
socket.on('live_data', function(data){
	$('.chat-discussion').append(data);
});

//接收在线用户列表
socket.on('online_list', function(user_list){
	//每次有新的用户登录后，先将原来的用户列表清除
	$('.users-list').children().remove();
	var html = '';
	for(var i = 0; i < user_list.length; i++)
	{
		//非直播页面过滤掉直播员
		if(user_list[i] == 'owen')
		{
			continue;
		}

		html += '<div class="chat-user"><span class="pull-right label label-success">Online</span>' + 
		        '<img class="chat-avatar" src="images/a' + (i + 1) + '.jpg" alt="" /><div class="chat-user-name">' + 
				'<a href="chat_view.html#">' + user_list[i] + '</a></div></div>';					
	}
	$('.users-list').append(html);
});