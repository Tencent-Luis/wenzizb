/**
 * 项目入口文件
 */
//设置路径全局变量
global.BASE_DIR = __dirname;    //项目绝对路径
global.APP = BASE_DIR + "/app";
global.CONTROLLER = APP + "/controller/";
global.CORE = APP + "/core/";
global.LIB = BASE_DIR + "/node_modules/";    //第三方模块库
global.CONF = BASE_DIR + "/conf/";      //配置文件
global.STATIC = BASE_DIR + "/static/";     //静态资源文件
global.VIEW = BASE_DIR + "/view/";     //视图文件

//modules的引入
global.modules =      //添加命名空间，避免变量重名
{
    http: require('http'),
    fs: require('fs'),
    url: require('url'),
    queryString: require('querystring'),
    httpParam: require(LIB + 'httpParams'),
    staticModule: require(LIB + 'static_module'),    //静态文件模块static_module引入
    router: require(CORE + 'router'),
    action: require(CORE + 'action'),
    pug: require('pug'),     //jade模板
    socket: require('socket.io'),
    path: require('path'),
    parseCookie: require('cookie-parse'),    //第三方cookie库
    NodeSession: require('node-session'),   //第三方session库
    util: require('util')
};

global.onlineList = [];     //存储socket连接用户信息

//创建服务
global.app = modules.http.createServer(function(request, response){
    /**
     * 为response添加页面渲染函数
     */
    response.render = function(){
        var template = arguments[0];    //获取模板文件名
        var options = arguments[1];    //获取传递给模板中的参数对象
        
        var str = modules.fs.readFileSync(template, 'utf8');   //同步读取模板文件，并以utf8的格式返回字符串
        var fn = modules.pug.compile(str, {filename: template});   //编译模板文件
        var page = fn(options);    //获取被编译的模板文件

        response.writeHead(200, {'Content-Type': 'text/html'});    //设置头信息
        response.end(page);
    }

    //路由访问，处理http请求
    modules.router.router(request, response);
}).listen(8000);

//设置全局的socket.io，启动socket服务
global.io = modules.socket.listen(app);