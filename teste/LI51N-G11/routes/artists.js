var express = require('express');
const controller = require('../controller/controller.js');
var router = express.Router();

/* GET user and albuns listing. */
router.get('/:id', function(req, res, next) {
    var username= null;
    if(req.user) username=(req.user.username!=null?req.user.username:null);
    controller.artists(req.params.id,username, function(error, data){
        if(error) return next(err);
        else{
            res.status(200).send(data);
        }
    });
});

module.exports = router;