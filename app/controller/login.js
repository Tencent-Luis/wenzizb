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
            //确保每次只发送一个socket消息,浏览器刷新时，也只显示一组数据
            if(time > 0)
            {
                return;
            }

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
                socket.emit('live_data', message);    //将历史记录发送到客户端
                io.sockets.emit('online_list', n);     //如果有新用户登录后，则广播在线用户列表
            }

            refresh_online();

            socket.on('public', function(data){
                var insertMsg = '<div class="chat-message left"><img class="message-avatar" src="images/a2.jpg" />' + 
                    '<div class="message"><a class="message-author" style="color:blue;">' + user_name + '</a><span class="message-date">' + getTime() + '</span>' + 
                    '<span class="message-content">' + data.msg + '</span></div></div>';
                writeFile({'msg': insertMsg, 'data': data}, function(data){
                    io.sockets.emit('live_data', data);
                });
            });
            //断开连接
            socket.on('disconnect', function(){
                delete onlineList[user_name];
                //refresh_online();
            });

            time++;
        });

        return;
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
            //console.log(data.data);
            callback(data.msg);
        });
    }
}

/**
 * 获取格式化后的时间
 * @return string
 */
function getTime()
{
    var dates = new Date();
    var year = dates.getFullYear();
    var month = dates.getMonth() + 1;
    var date = dates.getDate();
    var day = new Array("星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六");
    var hour = (dates.getHours()) < 10 ? "0" + dates.getHours() : dates.getHours();
    var minute = (dates.getMinutes() < 10) ? "0" + dates.getMinutes() : dates.getMinutes();
    var second = (dates.getSeconds() < 10) ? "0" + dates.getSeconds() : dates.getSeconds();
    var currentTime = year + "-" + month + "-" + date + " " + hour + ":" + minute + ":" + second + " " + day[dates.getDay()];

    return currentTime;
}