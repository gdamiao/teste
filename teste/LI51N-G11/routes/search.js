var express = require('express');
const controller = require('../controller/controller.js');
var router = express.Router();

/* GET search listing. */
router.get('/:query', function(req, res, next) {
    var username= null;
    if(req.user)username=(req.user.username!=null?req.user.username:null);
    controller.search(req.params.query, username, function(error, data){
        if(error) return next(err);
        else{
                res.status(200).send(data);
        }
    });
});

router.get('/:query/previous', function(req, res, next) {
    var username= (req.user!=null?req.user:null);
    controller.searchPrevious(req.params.query,username, function(error, data){
        if(error) return next(err);
        else{
            res.status(200).send(data);
        }
    });
});
router.get('/:query/next', function(req, res, next) {
    var username= (req.user!=null?req.user:null);
    controller.searchNext(req.params.query, username, function(error, data){
        if(error) return next(err);
        else{
            res.status(200).send(data);
        }
    });
});
module.exports = router;