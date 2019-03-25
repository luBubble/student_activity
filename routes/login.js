var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
	
	req.getConnection(function(err, conn) {
        if (err) {
            return next(err);
        } else {
            conn.query('select * from users', [], function(err,result) {
                if (err) {
                    return next(err);
                } else {
                	console.log(result);
                    res.json(result); //可以直接把结果集转化Json返回给客户端
                }
            });
        }
    });
});

module.exports = router;
