/**
 * 登录
 * @author owen
 */
module.exports = function()
{
    var _request = arguments[0];
    var _response = arguments[1];

    /**
     * 检查session是否存在，来判断用户是否登录
     * @param  {string} model 访问的模块
     */
    this.checkSession = function(model)
    {
        if(model == 'login')
        {
            return true;
        }
        else if(sessionLib.userName && sessionLib.userName != '')    //判断session是否存在
        {
            return true;
        }

        return false;
    };

    /**
     * 获取客户端传递的username，然后启动socket服务，监听客户端连接
     */
    this.login = function()
    {
        modules.httpParam.POST('username', function(value){
            sessionLib.userName = value;    //设定session
            if(value == 'owen')
            {
                //直播员进入直播模块
                _response.render(VIEW + 'live.pug', {'user': value});
            }
            else
            {
                //非直播员进入观看模块
                _response.render(VIEW + 'main.pug', {'user': value});
            }
        });

        //启动socket服务，监听客户端连接
        var time = 0;       //避免socket发送多条消息
        io.sockets.on('connection', function(socket){
            var user_name = sessionLib.userName;
            //检查onlineList中，是否有socket连接用户信息
            if(!onlineList[user_name])
            {
                onlineList[user_name] = socket;    //没有,则存储
            }

            var refresh_online = function(){
                var n = [];
                for(var i in onlineList)
                {
                    n.push(i);
                }

                var message = modules.fs.readFileSync(BASE_DIR + '/live_data.txt', 'utf8');   //同步读取文件消息
                socket.emit('live_data', message);
                io.sockets.emit('online_list', n);     //对所有人发送消息
            }

            refresh_online();

            //确保每次只发送一个socket消息
            if(time > 0)
            {
                return;
            }
            socket.on('public', function(data){
                var insertMsg = '<li><span class="icon-user"></span>' + 
                    '<span class="live_user_name text-success">[owen]</span><span class="live_message text-info">' + 
                    data.msg + '</span></li>';
                writeFile({'msg': insertMsg, 'data': data}, function(data){
                    io.sockets.emit('msg', data);
                });
            });
            //断开连接
            socket.on('disconnect', function(){
                delete onlineList[user_name];
                refresh_online();
            });

            time++;
        });
    }
    
}