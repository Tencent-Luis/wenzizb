var socket = io('http://127.0.0.1:8000');
//接收消息
socket.on('msg', function(data){
	console.log(data);
});

//发送消息
function send()
{
	var message = $('#msg_txt').val();
	socket.emit('public', {msg: message}); 
}