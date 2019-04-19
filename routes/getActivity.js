var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/basic', function(req, res, next) {
	let {ac_id}=req.query
	req.getConnection(function(err, conn) {
        	if (err) {
            	return next(err);
        	} else {
        			let activityMsg={}
        			conn.query('select *,date_format(begin_date, "%Y-%m-%d") as begin_str,date_format(end_date, "%Y-%m-%d") as end_str from activity  where id= ?',[ac_id],function(err,result) {
                		if (err) {
                    		return next(err);
                		} else {
                			res.json({result:"success",basic:result[0]})
                		}
            		})
        	}
    });
});

router.get('/detail', function(req, res, next) {
	let {ac_id}=req.query
	req.getConnection(function(err, conn) {
        	if (err) {
            	return next(err);
        	} else {
        		conn.query('select * from activity_detail where ac_id= ?',[ac_id],function(err,result) {
                	if (err) {
                    	return next(err);
                	} else {
                		res.json({result:"success",detail:result})
                	}
            	})
        	}
    });
});

router.get('/timeLine', function(req, res, next) {
	let {ac_id}=req.query
	req.getConnection(function(err, conn) {
        	if (err) {
            	return next(err);
        	} else {
        		conn.query('select *,date_format(date_time, "%Y-%m-%d") as date_str from activity_time_line  where ac_id= ?',[ac_id],function(err,result) {
                	if (err) {
                    	return next(err);
                	} else {
                		res.json({result:"success",timeLine:result})
                	}
            	})
        	}
    });
});

router.get('/comment', function(req, res, next) {
	let {ac_id}=req.query
	req.getConnection(function(err, conn) {
        	if (err) {
            	return next(err);
        	} else {
        		conn.query(`select a1.wx_name as name1,a1.wx_avatar as avatar1,users.wx_name as name2,
        			users.wx_avatar as avatar2,a1.content,date_format(a1.time, "%m-%d %H:%i") as time_str,a1.time as time
					from (
							select c.*,u.wx_name,u.wx_avatar
							from `+'`comment`'+` as c,users as u
							WHERE c.ac_id=? and c.user_id=u.id
						) as a1
						LEFT JOIN users 
					on a1.another_user=users.id ORDER BY time DESC`,[ac_id],function(err,result) {
                	if (err) {
                    	return next(err);
                	} else {
                		res.json({result:"success",comment:result})
                	}
            	})
        	}
    });
});

router.get('/allActivity', function(req, res, next) {
	let {ac_id}=req.query
	req.getConnection(function(err, conn) {
        	if (err) {
            	return next(err);
        	} else {
        		conn.query(`select a.id,a.title,a.organizer,a.slide_pic1 as img,z.zan from activity as a
							LEFT JOIN (SELECT a2.id as ac_id,COUNT(zan.id) as zan 
										FROM activity as a2,zan 
										WHERE zan.ac_id=a2.id) as z
							on a.id=z.ac_id ORDER BY z.zan DESC`,function(err,result) {
                	if (err) {
                    	return next(err);
                	} else {
                		let allActivity=result
                		conn.query('select id,title,organizer,slide_pic1 as img from activity ORDER BY id DESC  LIMIT 2',function(err,result){
                			if(err){
                				return next(err);
                			} else {
                				res.json({result:"success",allActivity,newActivity:result})
                			}
                		})
                		
                	}
            	})
        	}
    });
});

module.exports = router;