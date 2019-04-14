let express = require('express');
let request = require('request');
let router = express.Router();

let wxConfig = require("../data/wxConfig.json");

router.get('/', function(req, res, next) {
	let code = req.query.code;
	let cookies = req.cookies;
	let reqOption={
		url:"https://api.weixin.qq.com/sns/jscode2session",
        json:true,
        qs:{
            grant_type:'authorization_code',
            appid:wxConfig.appId,
            secret:wxConfig.appSecret,
            js_code:code
        	}
      };
	request.get(reqOption,function(err, resp, data) {
		    if (resp.statusCode == 200) {
            let sessionKey = data.session_key
            let openid = data.openid
            let timestamp=new Date().getTime()
            let userMsg={}
//			//自定义的加密，作为session_id
//          var skey = sha1(sessionKey)
            let skey=sessionKey
            
//			//记录登录时间
            let loginMsg = {
                lastTime:timestamp,
                curTime:timestamp,
                cookies:cookies
            }
            
            let sessionData = { 
                session_id:skey,
                expires:60000,   //过期时间      
                data: JSON.stringify(loginMsg)
            }
            
            //session的MySQL管理器，设置session（如果session_id不存在，则写入数据库）
            req.sessionStore.set(skey,sessionData, function (err) {
                if(err) console.log("---sessionStore error----"+err)
            })
            //新增用户或绑定session_id
            req.getConnection(function(err, conn) {
        	if (err) {
            	return next(err);
        	} else {
        		conn.query('select type,identify,number,name,phone from users where openid= ? ',openid,function(err,result){
        			if ( result.length === 0) {
        				conn.query('insert into users(openid,session_id) values ( ? , ? )',[openid,skey],function(err,result) {
                			if (err) {
                    			return next(err);
                			} else {
                				console.log("----新增用户----");
                			}
            			});
        			} else {
        				console.log("----用户已存在----");
        				userMsg=result[0];
        				conn.query('update users set session_id = ? where openid= ?',[skey,openid],function(err,result) {
                			if (err) {
                    			return next(err);
                			} else {
                				console.log("----更新用户session----");
                			}
            			})
        			}
        		})
            	
        		}
    	});
            //返回给客户端
            res.json({	result:"授权成功",
            			session_data:sessionData,
            			openid:openid,userMsg:userMsg})
        } else {
            res.json({result:"error",err})
        }
        
});
    
});

module.exports = router;
