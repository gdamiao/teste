var express = require('express');
const controller = require('../controller/controller.js');
var router = express.Router();

/* GET user and albuns listing. */
router.get('/', function(req, res, next) {
    if (req.user) {
        res.status(200).render('homeViewLogin',{id:req.user.username});
    // logged in
    } else {
    // not logged in
        res.status(200).render('homeViewNoLogin');
    }
});

module.exports = router;