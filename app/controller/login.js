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
    }
    
}