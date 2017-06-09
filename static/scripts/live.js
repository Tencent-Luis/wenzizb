var socket = io('http://127.0.0.1:8000');
//接收消息
socket.on('live_data', function(data){
	$('.chat-discussion').append(data);
});

//发送消息
function send()
{
	var message = $('#msg_txt').val();
	socket.emit('public', {msg: message}); 
	$('#msg_txt').val('');   //发送后，清空文本框
}