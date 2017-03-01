var express = require('express');
const controller = require('../controller/controller.js');
var router = express.Router();

/* GET user and albuns listing. */
router.get('/', function(req, res, next) {
    if (!req.user) {
        res.status(200).render('homeViewNoLogin');
    // not logged in
    } else {
    // logged in
        controller.getUserInvitesNumber(req.user.username,function(err,data){
            res.status(200).render('homeViewLogin',{id:req.user.username,invites:data});
        })
    }
});

module.exports = router;