/**
 * 对url请求进行处理，同时分发到相应的controller进行逻辑处理
 */
var Login = require(CONTROLLER + 'login');   //获取登录模块

exports.router = function(request, response)
{
    //解析编码后的uri字符串
    var pathName = decodeURI(modules.url.parse(request.url).pathname);
    modules.httpParam.init(request, response);   //初始化http的GET和POST参数获取对象

    //启动session
    global.sessionLib = modules.session.startSession(request, response);

    var controller = pathName.substr(1);     //获取访问的controller
    //获取请求controller中的方法
    var action = modules.httpParam.GET('action');
    var Class = '';

    if(pathName == '/favicon.ico')
    {
        //忽略favicon请求
        return;
    }
    else if(pathName == '/')
    {
        //默认进入index.pug页面(首页)
        response.render(VIEW + 'index.pug');
        return;
    }

    try 
    {
        //加载请求的controller类
        Class = require(CONTROLLER + controller);
    } 
    catch (error) 
    {
        //若require一个controller失败，则默认是静态文件请求
        modules.staticModule.getStaticFile(pathName, response, request, BASE_DIR);
        return;
    }

    if(Class)
    {
        var login = new Login(request, response);
        var ret = login.checkSession(controller);    //检查用户是否登录过
        if(ret)
        {
            var object = new Class(request, response);  //创建controller对象
            object[action].call();   //调用controller对象的action方法
        }
        else
        {
            response.render(VIEW + 'index.pug');   //未登录跳转到首页
        }
    }
    else
    {
        response.writeHead(404, {'Content-Type': 'text/plain'});
        response.end('can not find source');
    }
}