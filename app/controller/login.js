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
        else if(_request.session.get('account') && _request.session.get('account') != '')    //判断session是否存在
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
            _request.session.put('account', value);    //设定session
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
            var user_name = _request.session.get('account');   //通过session获取当前登录用户名
            //检查onlineList中，是否有socket连接用户信息
            //检查用户是否已经存在于在线用户列表
            if(!onlineList[user_name])
            {
                onlineList[user_name] = socket;    //没有或不存在,则存储
            }

            //设置刷新在线用户函数
            var refresh_online = function(){
                var n = [];
                for(var i in onlineList)
                {
                    n.push(i);
                }

                var message = modules.fs.readFileSync(BASE_DIR + '/live_data.txt', 'utf8');   //同步读取文件消息
                socket.emit('live_data', message);
                io.sockets.emit('online_list', n);     //如果有新用户登录后，则广播在线用户列表
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
    
    /**
     * 异步写数据到文件中
     * @param  {string} data 被写入的数据
     * @param  {function} callback 回调函数
     */
    function writeFile(data, callback)
    {
        //以utf8的格式，同步读取数据
        var message = modules.fs.readFileSync(BASE_DIR + '/live_data.txt', 'utf8');
        //以追加的方式，异步写入数据
        modules.fs.writeFile(BASE_DIR + '/live_data.txt', message + data.msg, function(err){
            if(err)
            {
                throw err;
            }
            console.log(data.data);
        });
    }
}