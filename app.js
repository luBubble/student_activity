var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var bodyParser=require('body-parser');

//连接数据库
var mysql = require('mysql'), 
    myConnection = require('express-myconnection'),
    dbOptions = {
      host: 'localhost',
      user: 'root',
      password: '',
      port: 3306,
      database: 'student_activity'
    };
//配置session
var session = require('express-session'),
	MysqlStore = require('express-mysql-session'),
	sessionOptions = {
    host:'localhost',
    port:3306,
    user:'root',
    password:'',
    database:'student_activity',
    checkExpirationInterval:60000, //一分钟检查一次
    expiration: 3600000, //最大的生命期
    connectionLimit: 1,
    schema: {
        tableName: 'sessions', //表名
        columnNames: { //列
            session_id: 'session_id',
            expires: 'expires',
            data: 'data'
        }
    }
};
var sessionStore = new MysqlStore(sessionOptions);

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var loginRouter = require('./routes/login');

var app = express();

// view engine setup
//视图引擎设置
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json()); //解析 application/json
app.use(bodyParser.urlencoded({extended:true})); //表单类提交的数据
//在路由配置之前将数据库连接作为中间件来使用 
app.use(myConnection(mysql, dbOptions, 'single')); 

app.use(session({
    key: 'mgyusys', //自行设置密钥
    secret: 'sysuygm', //私钥
    cookie: { 
        maxAge: 60000  //最大生命期
        },
    store: sessionStore,  //存储管理器
    resave: false,
    saveUninitialized: false
}));

//路由配置
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/login',loginRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

//用nodemon实现热加载，将默认入口中的设置搬到这
var debug = require('debug')('my-application'); // debug模块
app.set('port', process.env.PORT || 3000); // 设定监听端口
//启动监听
var server = app.listen(app.get('port'), function() {
  debug('Express server listening on port ' + server.address().port);
});

//导出配置好的app
//module.exports = app;
