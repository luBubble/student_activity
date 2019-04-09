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
            let unionid=data.unionid
            let timestamp=new Date().getTime()
            
//			//自定义的加密，作为session_id
//          var skey = sha1(sessionKey)
            let skey=sessionKey;
            
//			//记录登录时间
            let loginMsg = {
                lastTime:timestamp,
                curTime:timestamp,
                cookies:cookies
            }
            
            let sessionData = { 
                session_id:skey,
                expires:60000,         
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
        		conn.query('select id from users where openid='+openid,[],function(err,result){
        			if ( result === undefined || result.length === 0) {
        				conn.query('insert into users(openid,unionid,session_id) values ("'+openid+'","'+unionid+'","'+skey+'")',function(err,result) {
                			if (err) {
                    			return next(err);
                			} else {
                				console.log("--成功新增用户呵呵呵呵--");
                			}
            			});
        			} else {
        				console.log("--用户已存在哈哈哈哈--");
        			}
        		})
            	
        		}
    	});
            //返回给客户端
            res.json({session_data:sessionData,openid:openid})
        } else {
            res.json(err)
        }
        
});
    
});

module.exports = router;
