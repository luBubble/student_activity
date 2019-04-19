var express = require('express')
var router = express.Router()

var multer  = require('multer')
var path=require('path');  
// 使用硬盘存储模式设置存放接收到的文件的路径以及文件名
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // 接收到文件后输出的保存路径
        cb(null, 'public/images/');    
    },
    filename: function (req, file, cb) {
        // 将保存文件名设置为 'detailPic-' + 时间戳，比如 detailPic-151342376785.jpg
		var extname=path.extname(file.originalname);//获取文件的后缀名
        cb(null, "activityPic-" + Date.now()+extname);  
    }
})
var upload = multer({ storage: storage})

router.get('/', function(req, res, next) {
	let {openid, draft, verify, title, address, organizer, contractor, beganDate, endDate, timeLineDatas ,detailType } = req.query
	let activityId=null
	req.getConnection(function(err, conn) {
        	if (err) {
            	return next(err);
        	} else {
        		conn.query('select id from activity where title = ?',title,function(err,result) {
        		if (err) {
            		return next(err);
        		} else {
            		if (result.length == 0) {
						conn.query(`insert into activity(creator,is_draft,verify,title,address,organizer,contractor,begin_date,end_date,detail_type) 
            						 values(?,?,?,?,?,?,?,?,?,?)`,
            						[openid,draft,verify,title,address,organizer,contractor,beganDate,endDate,detailType],
            						function(err,result){
            							if(err) {
            								console.log("=====新建活动=====error"+err)
            							} else {
											conn.query('select id from activity where title= ?',title,function(err,result){
												activityId=result[0].id
												console.log("----"+timeLineDatas)
												let tlDatas=JSON.parse(timeLineDatas)
												for(let i=0; i<tlDatas.length; i++){
													console.log("----"+tlDatas.date+"----"+tlDatas.content)
													conn.query('insert into activity_time_line(ac_id,date_time,content) values(?,?,?)',
													[activityId,tlDatas[i].date,tlDatas[i].content],function(err,result){
														if(err) {
            												console.log("=====新建时间节点=====error"+err)
            											} else {
            												console.log("=====添加时间节点====")
            											}
													})
												}
												res.json({result:"success",ac_id:activityId})
											})
            							}
            						})
            		} else {
            			res.json({result:"活动名重复！"})
            		}
        		}
    			})
        	}
        	})
        	
});

router.get('/addDetailText',function(req, res, next){
	console.log("===添加详情文本===")
	let { ac_id, detailTextDatas } = req.query
	let datas=JSON.parse(detailTextDatas)
	req.getConnection(function(err, conn) {
        	if (err) {
            	return next(err);
        	} else {
        		let result='success'
        		console.log("===添加详情文本"+datas.length)
        		for(let i=0; i<datas.length; i++){
        			conn.query('insert into activity_detail(ac_id,title,content) values(?,?,?)',
        			[ ac_id, datas[i].title, datas[i].content ],function(err){
        				if(err){
        					console.log("===新增详情error===="+err)
        					result="详情模块创建失败"
        				} else {
        					console.log("===新增详情成功====")
        				}
        			})
        		}
        		console.log("===添加详情文本"+result)
        		res.json({result})
        	}
    })
});

router.post('/addDetailPic',upload.single('detailPic'),function(req, res, next){
	let ac_id=req.body.ac_id
	let file = req.file
	req.getConnection(function(err, conn) {
        	if (err) {
            	return next(err);
        	} else {
        			conn.query('update activity set detail_pic = ? where id= ?',[ file.filename, ac_id],function(err){
        				if(err){
        					console.log("===更新详情图片error===="+err)
        					res.json({result:"error",text:"详情图片保存失败"})
        				} else {
        					res.json({result:"success"})
        				}
        			})
        	}
    })

});

router.post('/addSlidePic',upload.single('slidePic'),function(req, res, next){
	let { ac_id, index}=req.body
	let file = req.file
	req.getConnection(function(err, conn) {
        	if (err) {
            	return next(err);
        	} else {
        			conn.query('update activity set slide_pic'+index+
        			' = ? where id= ?',[ file.filename, ac_id],
        			function(err){
        				if(err){
        					console.log("===更新轮播图图片error===="+err)
        				} else {
        					console.log("===更新轮播图成功！！===="+index)
        					res.json({result:"success"})
        				}
        			})
        	}
    })
	
//  console.log('文件类型：%s', file.mimetype);
//  console.log('原始文件名：%s', file.originalname);
//  console.log('现在的文件名：%s', file.filename);
//  console.log('文件大小：%s', file.size);
//  console.log('文件保存路径：%s', file.path);

});



module.exports = router;