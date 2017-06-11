var socket = io('http://127.0.0.1:8000');
//接收消息
socket.on('live_data', function(data){
	$('.chat-discussion').append(data);
});

//接收在线用户列表
socket.on('online_list', function(user_list){
	var html = '';
	for(var i = 0; i < user_list.length; i++)
	{
		html += '<div class="chat-user"><span class="pull-right label label-success">Online</span>' + 
		        '<img class="chat-avatar" src="images/a' + (i + 1) + '.jpg" alt="" /><div class="chat-user-name">' + 
				'<a href="chat_view.html#">' + user_list[i] + '</a></div></div>';					
	}
	$('.users-list').append(html);
});